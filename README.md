# 玉秀｜健康生活顧問

純原生 HTML、CSS、JavaScript 的一頁式個人品牌網站，沒有 React、CSS framework 或編譯依賴。已依使用者提供的「一頁式網頁.zip」檔名置入全部 39 張圖片：8 張主內容圖片，以及案例 1～31。沒有生成圖片或代用照片。

## 檔案與啟動

`index.html` 是完整頁面與 SEO 資訊；`styles.css` 管理響應式樣式；`app.js` 處理導覽、故事展開、案例載入、Lightbox 與 Facebook 播放器；`content.js` 集中管理圖片對照。`assets/preview/` 是等比例 WebP 預覽，`assets/original/` 保留故事歷程及案例的附件原圖。

在下載版所在目錄執行：

```bash
python3 -m http.server 3000
```

然後開啟 `http://localhost:3000`。專案開發目錄則使用 `python3 -m http.server 3000 --directory site`。發佈到一般靜態主機，只需放入完整網站檔案，不需要 npm 或 build。下載版的圖片資料使用相對檔案路徑，不依賴 Manus 儲存服務。

## 圖片對應

01首頁形象照.png → Hero；02故事主圖.png → About 主圖；03關於我.jpg、04關於我.jpg、05關於我.jpg → 個人体態歷程；06獎狀.jpg → 國際期刊研究區；07CNFCD原理圖.jpg → CNFCD 核心概念區；08TCA循環圖.jpg → TCA 能量循環區。案例1.jpg～案例31.jpg按數字順序置入成果 Gallery。

原始附件中的 03／04／05 檔案內容相同，仍按使用者指定檔名逐一對應，不自行刪除或替換。檔名只存在維護資料，不顯示於頁面或 Lightbox。

網頁預覽僅等比例縮小與重新編碼，沒有裁切、修圖或增加圖片內容。人物及圖表版位按原圖比例排版，案例外框統一方形，使用 `object-fit: contain` 與留白確保完整呈現。圓角在外框，圖片有安全留白，不會截掉邊緣文字。width／height 保留原圖尺寸比例，降低版面跳動。

## 案例及完整圖片

初始顯示 12 張案例，「查看更多案例」依序增加為 24、31 張。31 是附件實際案例數量；不重複照片、不新增空白假案例湊滿整列。桌機固定 3 欄，手機固定 2 欄。

故事歷程與案例可點擊開啟完整圖片燈箱；原始大圖只在開啟或切換 Lightbox 時才載入。支援關閉、上一張、下一張、左右鍵與 Esc，以及關閉後焦點回復。Hero、About 主圖、獎狀不啟用放大。

後續新增案例只需向 `content.js` 的 `cases` 陣列追加物件，填入唯一 `id`、圖片路徑、真實 `alt`、原圖 `width`／`height`；如有預覽與原圖兩種版本，分別填 `src`／`fullSrc`。不需要修改 HTML。

## Facebook 與 SEO

官方 `fb-video` + JavaScript SDK 嵌入指定公開 Reel，不自動播放；受 Facebook 隱私、登入或瀏覽器限制時保留播放按鈕，可另開原影片。附件沒有提供影片封面，因此不挪用照片作假封面。

Reel：https://www.facebook.com/reel/1321267809486536
論文：https://doi.org/10.1080/17517575.2026.2680206
研究介紹：https://vkang.com.tw/blog_post/59

網站保留原研究來源及觀察性研究不等於個人效果保證的說明。正式網址未提供，因此不猜測 canonical／og:url。研究數字未逐項核對出版社論文全文，不宣稱逐項獨立驗證完成。
