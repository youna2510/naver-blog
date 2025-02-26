document.addEventListener("DOMContentLoaded", async function () {
  const accessToken = localStorage.getItem("access_token");
  const tempContainer = document.querySelector(".temp_writing_container");

  if (!accessToken) {
    alert("로그인이 필요합니다.");
    window.location.href = "login.html";
    return;
  }

  async function fetchDrafts() {
    const response = await fetch("http://127.0.0.1:8000/posts/drafts/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200) {
      const drafts = await response.json();
      renderDrafts(drafts);
    } else {
      alert("임시저장 글을 불러오는 데 실패했습니다.");
    }
  }

  function renderDrafts(drafts) {
    tempContainer.innerHTML = "";

    if (drafts.length === 0) {
      tempContainer.innerHTML = "<p>임시저장된 글이 없습니다.</p>";
      document.querySelector("#ment").textContent = "0개";
      return;
    }

    drafts.forEach((post) => {
      const draftElement = document.createElement("div");
      draftElement.classList.add("temp_writing");

      draftElement.innerHTML = `  
        <input type="checkbox" class="check" name="temp_writes" data-id="${
          post.id
        }" style="visibility:hidden" />
        <div class="temp_title">${post.title}</div>
        <div class="temp_date">${new Date(
          post.created_at
        ).toLocaleString()}</div>
      `;

      draftElement.addEventListener("click", function (event) {
        if (event.target.classList.contains("check")) return;

        if (window.opener) {
          window.opener.location.href = `write_edit.html?id=${post.id}`;
        } else {
          window.location.href = `write_edit.html?id=${post.id}`;
        }
        window.close();
      });

      tempContainer.appendChild(draftElement);
    });

    document.querySelector("#ment").textContent = `${drafts.length}개`;
  }

  await fetchDrafts();

  // ✅ 전체 삭제 버튼 이벤트 (수정 적용)
  document
    .getElementById("delete_all")
    .addEventListener("click", async function () {
      if (!confirm("모든 임시저장 글을 삭제하시겠습니까?")) return;

      const checkboxes = document.querySelectorAll("input[name='temp_writes']");
      const idsToDelete = Array.from(checkboxes).map(
        (checkbox) => checkbox.dataset.id
      );

      try {
        const deletePromises = idsToDelete.map((id) =>
          fetch(`http://127.0.0.1:8000/posts/me/${id}/manage/`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${accessToken}` },
          })
        );

        await Promise.all(deletePromises);
        alert("✅ 모든 임시저장 글이 삭제되었습니다.");
        fetchDrafts();
      } catch (error) {
        console.error("🚨 전체 삭제 오류:", error);
        alert("전체 삭제에 실패했습니다.");
      }
    });

  // ✅ 선택 삭제 버튼 이벤트 (수정 적용)
  document
    .getElementById("select_delete")
    .addEventListener("click", async function () {
      const checkedBoxes = document.querySelectorAll(
        "input[name='temp_writes']:checked"
      );

      if (checkedBoxes.length === 0) {
        alert("삭제할 게시물을 선택하세요.");
        return;
      }

      if (
        !confirm(`${checkedBoxes.length}개의 임시저장 글을 삭제하시겠습니까?`)
      )
        return;

      const idsToDelete = Array.from(checkedBoxes).map(
        (checkbox) => checkbox.dataset.id
      );

      try {
        const deletePromises = idsToDelete.map((id) =>
          fetch(`http://127.0.0.1:8000/posts/me/${id}/manage/`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${accessToken}` },
          })
        );

        await Promise.all(deletePromises);
        alert("✅ 선택한 임시저장 글이 삭제되었습니다.");
        fetchDrafts();
      } catch (error) {
        console.error("🚨 선택 삭제 오류:", error);
        alert("선택 삭제에 실패했습니다.");
      }
    });
});

// ✅ 기존 유지되는 함수들
function close_popup() {
  window.close();
}

function edit() {
  document.getElementById("edit_btn").textContent = "완료";
  document.getElementById("ment").textContent = "개 선택됨";
  document.getElementById("edit_btn").style.marginLeft = "80px";
  document.getElementById("delete_all").style.visibility = "visible";
  document.getElementById("select_delete").style.visibility = "visible";
  document.querySelectorAll("[name='temp_writes']").forEach((checkbox) => {
    checkbox.style.visibility = "visible";
  });
  document.getElementById("edit_btn").setAttribute("onclick", "finish()");
}

function finish() {
  document.getElementById("edit_btn").textContent = "편집";
  document.getElementById("ment").textContent = "개";
  document.getElementById("edit_btn").style.marginLeft = "134px";
  document.getElementById("delete_all").style.visibility = "hidden";
  document.getElementById("select_delete").style.visibility = "hidden";
  document.querySelectorAll("[name='temp_writes']").forEach((checkbox) => {
    checkbox.checked = false;
    checkbox.style.visibility = "hidden";
  });
  document.getElementById("edit_btn").setAttribute("onclick", "edit()");
}
