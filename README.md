# Dear My Color 신청폼

퍼스널컬러 체험 신청을 받아 **Google 스프레드시트에 자동 저장**하는 정적 웹사이트입니다. Vercel에 그대로 배포할 수 있습니다.

## 파일 구성

```
새 폴더/
├─ index.html                 첫 화면 + 신청폼
├─ styles.css                 디자인
├─ app.js                     입력 검사, 시트로 전송
├─ config.js                  ★ Apps Script URL을 넣는 곳
├─ assets/dear-my-color-cover.jpeg
├─ google-apps-script/Code.gs  스프레드시트에 붙여넣을 코드 (배포 대상 아님)
└─ vercel.json                Vercel 설정
```

---

## 1단계. 스프레드시트 연동

1. [Google 스프레드시트](https://sheets.new)에서 새 시트를 만듭니다. (예: `Dear My Color 신청`)
2. 메뉴 **확장 프로그램 → Apps Script**를 엽니다.
3. 기본 코드를 모두 지우고 `google-apps-script/Code.gs` 내용을 붙여넣은 뒤 저장합니다 (Ctrl+S).
4. 오른쪽 위 **배포 → 새 배포**를 누릅니다.
   - 유형 선택(톱니바퀴) → **웹 앱**
   - 다음 사용자 인증 정보로 실행: **나**
   - 액세스 권한이 있는 사용자: **모든 사용자**
5. **배포** → 권한 승인 (“확인되지 않은 앱” 경고가 나오면 *고급 → (프로젝트 이름)(으)로 이동*)
6. 나오는 **웹 앱 URL**(`https://script.google.com/macros/s/.../exec`)을 복사합니다.
7. `config.js`를 열어 붙여넣습니다.

   ```js
   window.APP_CONFIG = {
     SHEET_ENDPOINT: "https://script.google.com/macros/s/AKfycb.../exec"
   };
   ```

8. VS Code의 Live Server로 `index.html`을 열고 테스트로 신청해 보세요. 시트에 `신청목록` 탭이 생기고 한 줄이 추가되면 성공입니다.

> **Code.gs를 수정했다면** 배포 → 배포 관리 → 연필 아이콘 → 버전: **새 버전** → 배포. 이렇게 해야 URL은 그대로 두고 내용만 바뀝니다. ("새 배포"를 다시 누르면 URL이 바뀝니다.)

---

## 2단계. Vercel 배포

### 방법 A — GitHub 연동 (추천, 수정할 때마다 자동 배포)

1. GitHub에서 새 저장소를 만듭니다. (예: `dear-my-color`)
2. 이 폴더의 파일들을 업로드합니다.
   - 웹에서: 저장소 → **Add file → Upload files** → 폴더 안 파일 전부 드래그 → Commit
   - 또는 GitHub Desktop으로 이 폴더를 저장소로 추가해서 Push
3. [vercel.com](https://vercel.com) → GitHub 계정으로 로그인 → **Add New… → Project**
4. 방금 만든 저장소 **Import**
5. 설정은 그대로 둡니다. (Framework Preset: **Other**, Build Command 없음, Output Directory 비워둠)
6. **Deploy** → 1분 안에 `https://dear-my-color.vercel.app` 같은 주소가 나옵니다.

이후 GitHub에 수정본을 올리면 자동으로 다시 배포됩니다.

### 방법 B — CLI로 바로 올리기

```bash
npm i -g vercel
cd "이 폴더 경로"
vercel          # 처음: 로그인 + 프로젝트 생성 (질문은 전부 Enter)
vercel --prod   # 실제 주소로 배포
```

---

## 문제 해결

| 증상 | 확인할 것 |
| --- | --- |
| "config.js에 SHEET_ENDPOINT가 설정되지 않았습니다" | `config.js`에 URL을 넣었는지 |
| "신청 전송에 실패했어요" | Apps Script 액세스 권한이 **모든 사용자**인지, URL이 `/exec`로 끝나는지 |
| 웹 앱 URL을 브라우저로 열었을 때 | `{"ok":true,...}`가 보이면 정상 |
| 시트에 저장이 안 됨 | Apps Script → **실행** 메뉴에서 오류 로그 확인 |
