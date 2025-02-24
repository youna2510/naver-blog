// ✅ 카테고리 불러오기 및 표시
document.addEventListener("DOMContentLoaded", async function () {
    // 🔥 제목 및 본문 가져오기 (window.opener에서)
  
    const accessToken = localStorage.getItem("access_token");
  
    // ✅ 주제 표시
    const topicDisplay = document.querySelector(".topic");
    const savedTopic = localStorage.getItem("selectedTopic") || "주제 없음";
    topicDisplay.textContent = `${savedTopic} >`;
  
    // ✅ 카테고리 표시
    const categoryList = document.getElementById("cat");
    categoryList.innerHTML = "<p>카테고리를 불러오는 중...</p>";
  
    if (!accessToken) {
      alert("로그인이 필요합니다.");
      window.location.href = "login.html";
      return;
    }
  
    try {
      const response = await fetch("http://127.0.0.1:8000/category/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
  
      if (response.status === 200) {
        const categories = await response.json();
        categoryList.innerHTML = ""; // 기존 내용 초기화
  
        // ✅ 전체 리스트 구획 스타일
        const ul = document.createElement("ul");
        ul.style.listStyleType = "none";
        ul.style.padding = "0";
        ul.style.border = "1px solid #ccc";
        ul.style.borderRadius = "8px";
        ul.style.maxHeight = "250px";
        ul.style.overflowY = "auto";
        ul.style.margin = "10px 0";
        ul.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.1)";
  
        let selectedItem = null; // 선택된 카테고리 저장
  
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
  
          // 기본 스타일 및 호버 효과
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
      categoryList.innerHTML = "<p>카테고리를 불러오지 못했습니다. </p>";
      categoryList.innerHTML += '<div id="category-options"></div>';
    }
  
    const publishButton = document.querySelector(".submit_btn");
  
    publishButton.addEventListener("click", function () {
      const selectedCategory = localStorage.getItem("selectedCategory") || "";
      const selectedTopic = localStorage.getItem("selectedTopic") || "주제 없음";
      const openSetting = document.querySelector(
        'input[name="open"]:checked'
      ).value;
  
      if (!selectedCategory) {
        alert("카테고리를 선택해주세요.");
        return;
      }
  
      // ✅ 부모 창으로 데이터 전송
      window.opener.postMessage(
        {
          type: "SAVE_DATA",
          payload: {
            category: selectedCategory,
            subject: selectedTopic,
            open: openSetting,
          },
        },
        "*"
      );
  
      console.log("🚀 [자식 창] 부모 창으로 발행 데이터 전송 완료");
  
      window.close(); // 자식 창 닫기
    });
  
    const tempSaveButton = document.querySelector(".tempsave_btn");
  
    console.log("tempSaveButton:", tempSaveButton); // ✅ tempSaveButton이 제대로 찾았는지 확인
    if (!tempSaveButton) {
      console.error("🚨 tempSaveButton 요소를 찾을 수 없습니다! HTML 확인 필요");
    }
  
    tempSaveButton.addEventListener("click", function () {
      const selectedCategory = localStorage.getItem("selectedCategory") || "";
      const selectedTopic = localStorage.getItem("selectedTopic") || "주제 없음";
      const openSetting = document.querySelector(
        'input[name="open"]:checked'
      ).value;
  
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
  
      console.log("🚀 [자식 창] 부모 창으로 발행 데이터 전송 완료");
  
      window.close(); // 자식 창 닫기
    });
  });
  
  // ✅ Base64 → File 변환
  /*
  function extractBase64Images(content) {
    return [...content.matchAll(/src="(data:image.*?base64,.*?)"/g)].map(
      ([_, base64], idx) => {
        const file = new File(
          [Uint8Array.from(atob(base64.split(",")[1]), (c) => c.charCodeAt(0))],
          `img_${idx}.png`,
          { type: "image/png" }
        );
        return { file };
      }
    );
  }
  */
  