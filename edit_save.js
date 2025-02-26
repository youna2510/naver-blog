document.addEventListener("DOMContentLoaded", async function () {
    const postId = new URLSearchParams(window.location.search).get("id");
  
    if (!postId) {
      alert("잘못된 접근입니다.");
      window.close();
      return;
    }
  
    const accessToken = localStorage.getItem("access_token");
  
    if (!accessToken) {
      alert("로그인이 필요합니다.");
      window.location.href = "login.html";
      return;
    }
  
    try {
      let apiUrl = `http://127.0.0.1:8000/posts/me/${postId}/`; // ✅ 기본값: 발행된 글
      let response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
  
      // ✅ 발행된 글이 없으면, 자동으로 임시저장 API 요청
      if (response.status === 404) {
        console.log("📌 발행된 글이 없으므로 임시저장 글을 조회합니다...");
        apiUrl = `http://127.0.0.1:8000/posts/drafts/${postId}/`; // ✅ 임시저장 API
        response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });
      }
  
      if (!response.ok) {
        throw new Error("게시물 정보를 불러올 수 없습니다.");
      }
  
      const postData = await response.json();
  
      // ✅ 기존 주제 표시
      const topicDisplay = document.querySelector(".topic");
      topicDisplay.textContent = `${postData.subject || "주제 없음"} >`;
  
      // ✅ 기존 공개 설정 유지
      document
        .querySelector(`input[name="open"][value="${postData.visibility}"]`)
        ?.setAttribute("checked", "checked");
  
      // ✅ 기존 카테고리 자동 선택
      const categoryList = document.getElementById("cat");
      categoryList.innerHTML = "<p>카테고리를 불러오는 중...</p>";
  
      // ✅ 사용자 카테고리 가져오기
      const categoryResponse = await fetch("http://127.0.0.1:8000/category/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
  
      if (categoryResponse.status === 200) {
        const categories = await categoryResponse.json();
        categoryList.innerHTML = ""; // 기존 내용 초기화
  
        const ul = document.createElement("ul");
        ul.style.listStyleType = "none";
        ul.style.padding = "0";
        ul.style.border = "1px solid #ccc";
        ul.style.borderRadius = "8px";
        ul.style.maxHeight = "250px";
        ul.style.overflowY = "auto";
        ul.style.margin = "10px 0";
        ul.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.1)";
  
        let selectedItem = null; // 현재 선택된 카테고리 저장
  
        categories.forEach((cat) => {
          const li = document.createElement("li");
          li.textContent = cat.name;
          li.style.padding = "12px";
          li.style.margin = "4px 8px";
          li.style.borderRadius = "5px";
          li.style.cursor = "pointer";
          li.style.fontSize = "14px";
          li.style.transition = "background-color 0.3s, color 0.3s";
          li.style.textAlign = "center";
          li.style.fontWeight = "500";
  
          // ✅ 기존 게시물의 카테고리와 일치하면 선택된 상태로 표시
          if (cat.name === postData.category_name) {
            li.style.backgroundColor = "#4CAF50";
            li.style.color = "#fff";
            li.style.fontWeight = "bold";
            selectedItem = li;
            localStorage.setItem("selectedCategory", cat.name);
          }
  
          // ✅ 마우스 호버 효과 추가
          li.addEventListener(
            "mouseover",
            () => (li.style.backgroundColor = "#f0f0f0")
          );
          li.addEventListener("mouseout", () => {
            if (li !== selectedItem) {
              li.style.backgroundColor = "transparent";
              li.style.color = "#000";
            }
          });
  
          // ✅ 클릭 시 선택 스타일 적용
          li.addEventListener("click", () => {
            if (selectedItem) {
              selectedItem.style.backgroundColor = "transparent";
              selectedItem.style.color = "#000";
            }
            li.style.backgroundColor = "#4CAF50";
            li.style.color = "#fff";
            li.style.fontWeight = "bold";
            selectedItem = li;
  
            // ✅ 선택된 카테고리 저장
            localStorage.setItem("selectedCategory", cat.name);
          });
  
          ul.appendChild(li);
        });
  
        categoryList.appendChild(ul);
      } else {
        alert("카테고리 정보를 불러올 수 없습니다.");
      }
    } catch (error) {
      console.error("서버 연결 오류:", error);
      categoryList.innerHTML = "<p>카테고리를 불러오지 못했습니다.</p>";
    }
  
    // ✅ 발행 버튼 이벤트
    document.querySelector(".submit_btn").addEventListener("click", function () {
      const selectedCategory = localStorage.getItem("selectedCategory") || "";
      const selectedTopic = document
        .querySelector(".topic")
        .textContent.replace(" >", "");
      const openSetting = document.querySelector(
        'input[name="open"]:checked'
      )?.value;
  
      if (!selectedCategory) {
        alert("카테고리를 선택해주세요.");
        return;
      }
  
      // ✅ 부모 창으로 데이터 전송
      window.opener.postMessage(
        {
          type: "EDIT_SAVE_DATA",
          payload: {
            category: selectedCategory,
            subject: selectedTopic,
            open: openSetting,
          },
        },
        "*"
      );
  
      console.log("🚀 [자식 창] 부모 창으로 발행 데이터 전송 완료");
      window.close();
    });
  
    // ✅ 임시저장 버튼 이벤트
    document
      .querySelector(".tempsave_btn")
      .addEventListener("click", function () {
        const selectedCategory = localStorage.getItem("selectedCategory") || "";
        const selectedTopic = document
          .querySelector(".topic")
          .textContent.replace(" >", "");
        const openSetting = document.querySelector(
          'input[name="open"]:checked'
        )?.value;
  
        if (!selectedCategory) {
          alert("카테고리를 선택해주세요.");
          return;
        }
  
        // ✅ 부모 창으로 데이터 전송
        window.opener.postMessage(
          {
            type: "TEMP_SAVE_DATA",
            payload: {
              category: selectedCategory,
              subject: selectedTopic,
              open: openSetting,
            },
          },
          "*"
        );
  
        console.log("🚀 [자식 창] 부모 창으로 임시 저장 데이터 전송 완료");
        window.close();
      });
  });
  