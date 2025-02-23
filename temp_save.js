function close_popup() {
    window.close();
  }
  
  function edit() {
    document.getElementById("edit_btn").textContent = "완료";
    document.getElementById("ment").textContent = "개 선택됨";
    document.getElementById("edit_btn").style.marginLeft = "80px";
    document.getElementById("delete_all").style.visibility = "visible";
    document.getElementById("select_delete").style.visibility = "visible";
    const checkboxes = document.getElementsByName("temp_writes");
    for (let i = 0; i < checkboxes.length; i++) {
      checkboxes[i].style.visibility = "visible";
    }
    document.getElementById("edit_btn").setAttribute("onClick", "finish()");
  }
  
  function finish() {
    document.getElementById("edit_btn").textContent = "편집";
    document.getElementById("ment").textContent = "개";
    document.getElementById("edit_btn").style.marginLeft = "134px";
    document.getElementById("delete_all").style.visibility = "hidden";
    document.getElementById("select_delete").style.visibility = "hidden";
    const checkboxes = document.getElementsByName("temp_writes");
    for (let i = 0; i < checkboxes.length; i++) {
      checkboxes[i].style.visibility = "hidden";
    }
    document.getElementById("edit_btn").setAttribute("onClick", "edit()");
  }
  
  document.addEventListener("DOMContentLoaded", async function () {
    const accessToken = localStorage.getItem("access_token");
    const tempContainer = document.querySelector(".temp_writing_container"); // ✅ 목록을 표시할 컨테이너
  
    if (!accessToken) {
      alert("로그인이 필요합니다.");
      window.location.href = "login.html";
      return;
    }
  
    try {
      // ✅ 백엔드 API 호출 (임시저장된 게시물 가져오기)
      const response = await fetch("http://127.0.0.1:8000/posts/drafts/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
  
      if (response.status === 200) {
        const drafts = await response.json();
        tempContainer.innerHTML = ""; // 기존 데이터 초기화
  
        if (drafts.length === 0) {
          tempContainer.innerHTML = "<p>임시저장된 글이 없습니다.</p>";
          return;
        }
  
        drafts.forEach((post) => {
          const draftElement = document.createElement("div");
          draftElement.classList.add("temp_writing");
  
          draftElement.innerHTML = `
              <input type="checkbox" class="check" name="temp_writes" data-id="${
                post.id
              }" />
              <div class="temp_title">${post.title}</div>
              <div class="temp_date">${new Date(
                post.created_at
              ).toLocaleString()}</div>
            `;
          draftElement.addEventListener("click", function (event) {
            // ✅ 체크박스를 클릭한 경우 이벤트를 무시 (체크박스 체크 방지)
            if (event.target.classList.contains("check")) return;
  
            console.log(
              `📌 임시저장된 글 클릭됨: ${post.title} (ID: ${post.id})`
            );
          });
  
          tempContainer.appendChild(draftElement);
        });
  
        // ✅ 총 개수 업데이트
        document.querySelector("#ment").textContent = `${drafts.length}개`;
      } else {
        alert("임시저장 글을 불러오는 데 실패했습니다.");
      }
    } catch (error) {
      console.error("🚨 서버 연결 오류:", error);
      tempContainer.innerHTML = "<p>임시저장된 글을 불러오지 못했습니다.</p>";
    }
  });
  