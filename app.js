/* 原生互動，無外部 UI framework。 */
(() => {
  "use strict";
  const content = window.YUXIU_CONTENT;
  if (!content) return;
  const $ = (selector) => document.querySelector(selector);
  const navigation = $("#navigation");
  const menuToggle = $(".menu-toggle");

  function closeMenu() {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "開啟導覽選單");
    navigation.classList.remove("is-open");
  }
  menuToggle.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") !== "true";
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "關閉導覽選單" : "開啟導覽選單");
    navigation.classList.toggle("is-open", open);
  });
  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".site-header")) closeMenu();
  });

  const storyToggle = $("#story-toggle");
  const storyMore = $("#story-more");
  storyToggle.addEventListener("click", () => {
    const expand = storyMore.hidden;
    storyMore.hidden = !expand;
    storyToggle.setAttribute("aria-expanded", String(expand));
    storyToggle.firstChild.textContent = expand ? "收起內容 " : "顯示更多 ";
    storyToggle.querySelector("use").setAttribute("href", expand ? "#i-close" : "#i-plus");
  });

  const localPreview = ["localhost", "127.0.0.1", ""].includes(window.location.hostname) || window.location.protocol === "file:";
  function imageSource(item, full = false) {
    const remote = full ? (item.fullSrc || item.src) : item.src;
    const local = full ? (item.localFullSrc || item.localSrc) : item.localSrc;
    return localPreview && local ? local : remote;
  }

  function makeImage(item, eager = false) {
    const image = document.createElement("img");
    image.alt = item.alt || "健康生活照片";
    image.width = Number(item.width) || 1200;
    image.height = Number(item.height) || 900;
    image.loading = eager ? "eager" : "lazy";
    image.decoding = "async";
    if (eager) image.setAttribute("fetchpriority", "high");
    image.addEventListener("error", (event) => {
      if (item.localSrc && !image.dataset.localFallback && image.getAttribute("src") !== item.localSrc) {
        image.dataset.localFallback = "true";
        image.src = item.localSrc;
        event.stopImmediatePropagation();
      }
    });
    // 頁面只載入等比例预覽，原始大圖於 Lightbox 開啟時載入。
    image.src = imageSource(item);
    return image;
  }

  document.querySelectorAll("[data-media]").forEach((slot) => {
    const item = content.media[slot.dataset.media];
    if (!item || !item.src) return;
    const image = makeImage(item, slot.dataset.media === "hero");
    slot.removeAttribute("role");
    slot.removeAttribute("aria-label");
    slot.classList.add("has-image");
    slot.style.setProperty("--image-ratio", `${item.width} / ${item.height}`);
    slot.append(image);
    image.addEventListener("error", () => {
      image.remove();
      slot.setAttribute("role", "img");
      slot.setAttribute("aria-label", `${item.alt}，暫時無法載入`);
    }, { once: true });
  });

  let activeGroup = [];
  let activeIndex = 0;
  let previousFocus = null;
  const lightbox = $("#lightbox");
  const lightboxImage = $("#lightbox-image");
  const previousButton = $("#lightbox-prev");
  const nextButton = $("#lightbox-next");

  function showLightboxImage(index) {
    activeIndex = index;
    const item = activeGroup[activeIndex];
    if (!item) return;
    lightboxImage.alt = item.alt || "完整圖片";
    lightboxImage.width = Number(item.width) || 1200;
    lightboxImage.height = Number(item.height) || 900;
    lightboxImage.dataset.localFallback = "";
    lightboxImage.dataset.fallbackSrc = item.localFullSrc || item.localSrc || "";
    lightboxImage.src = imageSource(item, true);
    $("#lightbox-counter").textContent = `${activeIndex + 1} / ${activeGroup.length}`;
    previousButton.disabled = activeIndex === 0;
    nextButton.disabled = activeIndex === activeGroup.length - 1;
  }
  function openLightbox(item, group) {
    activeGroup = group.filter((entry) => Boolean(entry.src));
    const index = activeGroup.findIndex((entry) => entry.id === item.id);
    if (index < 0) return;
    previousFocus = document.activeElement;
    showLightboxImage(index);
    lightbox.showModal();
    document.body.classList.add("modal-open");
    $("#lightbox-close").focus();
  }
  function closeLightbox() { lightbox.close(); }
  $("#lightbox-close").addEventListener("click", closeLightbox);
  previousButton.addEventListener("click", () => {
    if (activeIndex > 0) showLightboxImage(activeIndex - 1);
  });
  nextButton.addEventListener("click", () => {
    if (activeIndex < activeGroup.length - 1) showLightboxImage(activeIndex + 1);
  });
  lightbox.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" && activeIndex > 0) { event.preventDefault(); showLightboxImage(activeIndex - 1); }
    if (event.key === "ArrowRight" && activeIndex < activeGroup.length - 1) { event.preventDefault(); showLightboxImage(activeIndex + 1); }
  });
  lightbox.addEventListener("click", (event) => { if (event.target === lightbox) closeLightbox(); });
  lightbox.addEventListener("close", () => {
    document.body.classList.remove("modal-open");
    lightboxImage.removeAttribute("src");
    if (previousFocus instanceof HTMLElement) previousFocus.focus();
  });
  lightboxImage.addEventListener("error", () => {
    const fallbackSrc = lightboxImage.dataset.fallbackSrc;
    if (fallbackSrc && !lightboxImage.dataset.localFallback && lightboxImage.getAttribute("src") !== fallbackSrc) {
      lightboxImage.dataset.localFallback = "true";
      lightboxImage.src = fallbackSrc;
      return;
    }
    $("#lightbox-counter").textContent = "圖片暫時無法載入，請切換或關閉後重試。";
  });

  function createGalleryEntry(item, className, groupProvider) {
    const slot = document.createElement("div");
    slot.className = `media-slot ${className}`;
    if (!item.src) {
      slot.setAttribute("role", "img");
      slot.setAttribute("aria-label", `${item.alt}，待補`);
      return slot;
    }
    const image = makeImage(item);
    slot.classList.add("has-image");
    slot.style.setProperty("--image-ratio", `${item.width} / ${item.height}`);
    slot.append(image);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "media-button";
    button.setAttribute("aria-label", `放大檢視：${item.alt}`);
    button.append(slot);
    button.addEventListener("click", () => openLightbox(item, groupProvider()));
    image.addEventListener("error", () => {
      image.remove();
      button.disabled = true;
      button.setAttribute("aria-label", `${item.alt}，暫時無法載入`);
    }, { once: true });
    return button;
  }
  const journeyGallery = $("#journey-gallery");
  content.journey.forEach((item) => journeyGallery.append(createGalleryEntry(item, "journey-media", () => content.journey)));

  const caseGallery = $("#case-gallery");
  const loadMore = $("#load-more");
  const galleryStatus = $("#gallery-status");
  let visibleCount = 0;
  function renderMoreCases() {
    const pageSize = Math.max(1, Number(content.pageSize) || 12);
    const nextCount = Math.min(visibleCount + pageSize, content.cases.length);
    const fragment = document.createDocumentFragment();
    content.cases.slice(visibleCount, nextCount).forEach((item) => {
      fragment.append(createGalleryEntry(item, "case-media", () => content.cases.slice(0, visibleCount)));
    });
    caseGallery.append(fragment);
    visibleCount = nextCount;
    const actualCount = content.cases.slice(0, visibleCount).filter((item) => item.src).length;
    galleryStatus.textContent = actualCount ? `已顯示 ${actualCount} 張成果紀錄` : "案例圖片待補，不展示虛構成果。";
    // 最後一批保留按鈕焦點，避免按鈕消失造成鍵盤焦點遺失。
    if (visibleCount >= content.cases.length) {
      loadMore.disabled = true;
      loadMore.firstChild.textContent = "已顯示全部案例 ";
    }
    if (!content.cases.length) loadMore.hidden = true;
  }
  loadMore.addEventListener("click", renderMoreCases);
  renderMoreCases();

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navigation.querySelectorAll("a").forEach((link) => {
          if (link.getAttribute("href") === `#${entry.target.id}`) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-15% 0px -60% 0px", threshold: 0 });
    document.querySelectorAll("main > section[id]").forEach((section) => sectionObserver.observe(section));
    if (!reducedMotion) {
      const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.remove("is-pending"); revealObserver.unobserve(entry.target); }
      }), { threshold: .08 });
      document.querySelectorAll(".section-heading-split, .journey-heading, .elements-heading, .large-quote, .human-heading, .flow-heading, .contact-inner").forEach((element) => {
        element.classList.add("reveal", "is-pending");
        revealObserver.observe(element);
      });
    }
  }

  /* Facebook 官方 SDK + fb-video。只有收到官方 video ready 才移除 fallback。
   * iframe 的 load 可能只是錯誤/登入頁，不能當作影片成功。
   * 不嘗試讀取跨網域 iframe，不下載或虛構影片封面。 */
  const videoContainer = $("#video-container");
  const embed = $("#facebook-embed");
  const fallback = $("#video-fallback");
  const videoStatus = $("#video-status");
  let videoStarted = false;
  let sdkPromise = null;
  let videoTimer;
  function showVideoFallback(message) {
    fallback.hidden = false;
    embed.hidden = true;
    videoStatus.textContent = message;
  }
  function loadFacebookSDK() {
    if (window.FB) return Promise.resolve(window.FB);
    if (sdkPromise) return sdkPromise;
    sdkPromise = new Promise((resolve, reject) => {
      const oldInit = window.fbAsyncInit;
      window.fbAsyncInit = () => {
        if (typeof oldInit === "function") oldInit();
        window.FB.init({ xfbml: false, version: "v22.0" });
        resolve(window.FB);
      };
      const oldScript = document.getElementById("facebook-sdk");
      if (oldScript) oldScript.remove();
      const script = document.createElement("script");
      script.id = "facebook-sdk";
      script.src = "https://connect.facebook.net/zh_TW/sdk.js";
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onerror = () => { sdkPromise = null; reject(new Error("Facebook SDK unavailable")); };
      document.head.append(script);
    });
    return sdkPromise;
  }
  async function initializeVideo() {
    if (videoStarted) return;
    videoStarted = true;
    embed.hidden = false;
    fallback.hidden = false;
    videoStatus.textContent = "正在載入 Facebook 官方播放器";
    clearTimeout(videoTimer);
    videoTimer = setTimeout(() => showVideoFallback("無法直接載入時，點擊播放按鈕前往 Facebook 觀看。"), 12000);
    try {
      const FB = await loadFacebookSDK();
      const video = document.createElement("div");
      video.className = "fb-video";
      video.id = "cnfcd-facebook-video";
      video.dataset.href = content.facebook.embedVideoUrl;
      video.dataset.width = String(Math.round(videoContainer.clientWidth));
      video.dataset.showText = "false";
      video.dataset.autoplay = "false";
      video.dataset.allowfullscreen = "true";
      embed.replaceChildren(video);
      const onVideoReady = (event) => {
        if (event.type !== "video" || event.id !== video.id) return;
        clearTimeout(videoTimer);
        embed.hidden = false;
        fallback.hidden = true;
        videoStatus.textContent = "Facebook 官方播放器已就緒";
        FB.Event.unsubscribe("xfbml.ready", onVideoReady);
      };
      FB.Event.subscribe("xfbml.ready", onVideoReady);
      FB.XFBML.parse(embed);
    } catch (_error) {
      clearTimeout(videoTimer);
      showVideoFallback("播放器暫時無法載入，點擊播放按鈕前往 Facebook 觀看。");
    }
  }
  $("#video-retry").addEventListener("click", () => {
    videoStarted = false;
    if (!window.FB) { sdkPromise = null; }
    initializeVideo();
  });
  if ("IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) { initializeVideo(); videoObserver.disconnect(); }
    }, { rootMargin: "250px" });
    videoObserver.observe(videoContainer);
  } else initializeVideo();
})();
