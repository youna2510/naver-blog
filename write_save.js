// ✅ 부모 → 자식 데이터 수신
window.addEventListener("message", (event) => {
    if (event.data?.type === "POST_DATA") {
      const { title, content } = event.data.payload;
      window.postData = event.data.payload;
      console.log("📌 [자식] 받은 제목:", title);
      document.getElementById("titlePreview").innerText = title;
      document.getElementById("contentPreview").innerHTML = content;
    }
  });
  
  // ✅ 부모에 "CHILD_READY" 신호
  window.addEventListener("DOMContentLoaded", () => {
    window.opener?.postMessage("CHILD_READY", "*");
    console.log("🚀 [자식] CHILD_READY 전송");
  });
  
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
  
  
    try {
      const response = await fetch("http://127.0.0.1:8000/category/", {
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
  });
  
  // ✅ Base64 → File 변환
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
  
  // ✅ 게시물 전송
  async function sendPostToBackend() {
    const { title, content } = window.postData || {};
    if (!title || !content) return alert("제목 또는 본문이 없습니다.");
  
    const formData = new FormData();
    formData.append("title", title);
    formData.append("category_name", localStorage.getItem("selectedCategory"));
    formData.append(
      "subject",
      localStorage.getItem("selectedTopic") || "주제 없음"
    );
    formData.append("status", "published");
  
    extractBase64Images(content).forEach(({ file }) =>
      formData.append("images", file)
    );
  
    try {
      const response = await fetch("http://127.0.0.1:8000/posts/me/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: formData,
      });
      alert(response.ok ? "등록 성공" : "등록 실패");
    } catch (error) {
      console.error("게시 중 오류:", error);
    }
  }
  