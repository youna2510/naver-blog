document.addEventListener("DOMContentLoaded", async function () {
    console.log("✅ DOM 로드 완료, `comment.html` 불러오기 시작");
  
    try {
      // ✅ 댓글 모듈(comment.html) 먼저 로드
      const response = await fetch("comment.html");
      if (!response.ok)
        throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
  
      document.getElementById("comment-section").innerHTML =
        await response.text();
      console.log("✅ comment.html 로드 성공");
  
      await fetchUserProfile();
  
      // ✅ 댓글 컨테이너가 로드되었는지 확인 후 fetchPostId 실행
      if (document.querySelector(".comments-container")) {
        await fetchPostId();
      } else {
        console.error(
          "❌ 댓글 컨테이너(.comments-container)를 찾을 수 없습니다."
        );
      }
      // ✅ 댓글 등록 버튼 클릭 이벤트 추가
      const submitButton = document.querySelector(".submit_cmt");
      if (submitButton) {
        submitButton.addEventListener("click", function () {
          console.log("✅ 등록 버튼 클릭됨");
          const commentInput = document.getElementById("comment").value.trim();
          if (commentInput) {
            submitComment(commentInput); // ✅ 댓글 등록 함수 호출
          } else {
            alert("댓글을 입력하세요.");
          }
        });
      } else {
        console.error("❌ 등록 버튼을 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error("❌ 댓글 모듈 로드 실패:", error);
    }
  });
  
  /** ✅ 게시글 ID 가져오기 */
  async function fetchPostId() {
    console.log("✅ fetchPostId() 실행됨");
  
    const urlParams = new URLSearchParams(window.location.search);
    const n = urlParams.get("n") || 1;
    const url = `http://127.0.0.1:8000/posts/me/recent/?n=${n}`;
    const accessToken = localStorage.getItem("access_token");
  
    if (!accessToken) {
      console.warn("⚠️ 로그인되지 않은 사용자입니다.");
      return;
    }
  
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok)
        throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
  
      const { id } = await response.json();
      console.log("📌 가져온 게시물 ID:", id);
  
      document.getElementById("comment-section").setAttribute("data-post-id", id);
  
      // ✅ 댓글 컨테이너가 있는 경우에만 fetchComments 실행
      if (document.querySelector(".comments-container")) {
        fetchComments();
      } else {
        console.error(
          "❌ 댓글 컨테이너(.comments-container)를 찾을 수 없습니다."
        );
      }
    } catch (error) {
      console.error("❌ 게시물 ID 가져오기 실패:", error);
    }
  }
  
  /** ✅ 댓글 목록 불러오기 */
  async function fetchComments() {
    console.log("✅ fetchComments() 실행됨");
  
    const postId = document.getElementById("comment-section")?.dataset.postId;
    if (!postId) {
      console.error("❌ 게시글 ID를 찾을 수 없습니다.");
      return;
    }
  
    const commentContainer = document.querySelector(".comments-container");
    if (!commentContainer) {
      console.error(
        "❌ `.comments-container` 요소를 찾을 수 없어 댓글을 불러올 수 없습니다."
      );
      return;
    }
  
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/posts/${postId}/comments/`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
  
      if (!response.ok)
        throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
  
      const comments = await response.json();
      console.log(`✅ 게시물 ID ${postId}의 댓글 목록:`, comments);
  
      renderComments(comments);
    } catch (error) {
      console.error("❌ 댓글 불러오기 실패:", error);
    }
  }
  
  /** ✅ 댓글 렌더링 (대댓글 포함) */
  function renderComments(comments) {
    const commentContainer = document.querySelector(".comments-container");
    if (!commentContainer) {
      console.error(
        "❌ `.comments-container` 요소를 찾을 수 없어 댓글을 렌더링할 수 없습니다."
      );
      return;
    }
  
    commentContainer.innerHTML = "";
  
    if (comments.length === 0) {
      commentContainer.style.display = "none";
      return;
    }
  
    commentContainer.style.display = "block";
  
    comments.forEach((comment) => {
      const commentElement = createCommentElement(comment);
      commentContainer.appendChild(commentElement);
  
      // ✅ 대댓글이 존재하면 재귀적으로 추가
      if (comment.replies && comment.replies.length > 0) {
        const replyContainer = document.createElement("div");
        replyContainer.classList.add("replies-container");
        replyContainer.style.marginLeft = "20px"; // 들여쓰기 스타일 적용
        commentElement.appendChild(replyContainer);
  
        comment.replies.forEach((reply) => {
          replyContainer.appendChild(createCommentElement(reply, 1)); // ✅ 들여쓰기 적용
        });
      }
    });
  }
  
  /** ✅ 댓글 및 대댓글 요소 생성 */
  /** ✅ 댓글 및 대댓글 요소 생성 */
  function createCommentElement(comment, depth = 0) {
    const commentElement = document.createElement("div");
    commentElement.classList.add("writed_comments");
    commentElement.setAttribute("data-comment-id", comment.id);
    commentElement.style.marginLeft = `${depth * 20}px`; // ✅ 대댓글 들여쓰기
  
    commentElement.innerHTML = `
        <div class="comment-header">
          <a class="cmt_writer_nickname"><strong>${
            comment.author_name || "익명"
          }</strong></a>
          <span class="comment-date">${new Date(
            comment.created_at
          ).toLocaleString("ko-KR")}</span>
        </div>
        <div class="writing_comment">${
          comment.is_private ? "<i>비밀 댓글입니다.</i>" : comment.content
        }</div>
        <div class="comment_btns">
          <a class="reply_btn" data-comment-id="${
            comment.id
          }"><strong>답글</strong></a>
        </div>
        <div class="reply_form" id="reply_form_${
          comment.id
        }" style="display:none;">
          <textarea class="reply_input" placeholder="대댓글을 입력하세요"></textarea>
          <button class="submit_reply" data-parent-id="${
            comment.id
          }">등록</button>
        </div>
        <hr>
      `;
  
    // "답글" 버튼 클릭 시 대댓글 입력창 표시
    commentElement
      .querySelector(".reply_btn")
      .addEventListener("click", function () {
        const replyForm = document.getElementById(`reply_form_${comment.id}`);
        replyForm.style.display =
          replyForm.style.display === "none" ? "block" : "none";
      });
  
    // 대댓글 등록 이벤트 추가
    commentElement
      .querySelector(".submit_reply")
      .addEventListener("click", function () {
        const replyContent = commentElement
          .querySelector(".reply_input")
          .value.trim();
        if (replyContent) submitComment(replyContent, comment.id);
      });
  
    return commentElement;
  }
  
  /** ✅ 최상위 댓글 ID를 찾는 함수 */
  function getRootParentId(commentId) {
    let parentComment = document.querySelector(
      `[data-comment-id="${commentId}"]`
    );
  
    while (parentComment) {
      const parentId = parentComment.getAttribute("data-parent-id");
      if (!parentId) break; // 최상위 댓글이면 중단
      parentComment = document.querySelector(`[data-comment-id="${parentId}"]`);
    }
  
    return parentComment
      ? parentComment.getAttribute("data-comment-id")
      : commentId;
  }
  
  /** ✅ 댓글 및 대댓글 작성 */
  async function submitComment(content, parentId = null) {
    console.log("📌 submitComment() 실행됨", { content, parentId });
  
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      alert("로그인이 필요합니다.");
      return;
    }
  
    const postId = document.getElementById("comment-section")?.dataset.postId;
    if (!postId) {
      console.error("❌ 게시글 ID를 찾을 수 없습니다.");
      return;
    }
  
    // ✅ 부모 댓글이 있는 경우, 최상위 댓글 ID를 찾음
    const rootParentId = parentId ? getRootParentId(parentId) : null;
  
    const endpoint = `http://127.0.0.1:8000/posts/${postId}/comments/`;
  
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          content: content,
          parent: rootParentId, // ✅ 최상위 댓글을 부모로 설정
        }),
      });
  
      if (!response.ok)
        throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
  
      const newComment = await response.json();
      console.log("✅ 댓글 작성 성공:", newComment);
  
      document.getElementById("comment").value = ""; // 입력창 초기화
      addNewCommentToList(newComment, rootParentId);
  
      if (parentId) {
        const replyForm = document.getElementById(`reply_form_${parentId}`);
        if (replyForm) {
          replyForm.style.display = "none";
        }
      }
    } catch (error) {
      console.error("❌ 댓글 작성 실패:", error);
      alert("댓글을 저장하는 중 오류가 발생했습니다.");
    }
  }
  
  /** ✅ 새 댓글을 목록에 즉시 추가 (대댓글 포함) */
  function addNewCommentToList(comment, parentId = null) {
    let commentContainer = document.querySelector(".comments-container");
  
    // ✅ 댓글 컨테이너가 없으면 생성
    if (!commentContainer) {
      commentContainer = document.createElement("div");
      commentContainer.classList.add("comments-container");
      document.getElementById("comment-section").appendChild(commentContainer);
    }
  
    // ✅ 첫 댓글이 추가될 때, 댓글 컨테이너를 표시
    commentContainer.style.display = "block";
  
    if (!parentId) {
      // ✅ 일반 댓글인 경우, 리스트 맨 아래에 추가
      commentContainer.append(createCommentElement(comment));
    } else {
      // ✅ 대댓글인 경우, 부모 댓글 아래에 추가
      const parentComment = document.querySelector(
        `[data-comment-id="${parentId}"]`
      );
      if (parentComment) {
        let replyContainer = parentComment.querySelector(".replies-container");
  
        // ✅ 대댓글 컨테이너가 없으면 생성
        if (!replyContainer) {
          replyContainer = document.createElement("div");
          replyContainer.classList.add("replies-container");
          replyContainer.style.marginLeft = "20px"; // 들여쓰기
          parentComment.appendChild(replyContainer);
        }
  
        replyContainer.appendChild(createCommentElement(comment, 1)); // ✅ 들여쓰기 적용
      }
    }
  }
  
  /** ✅ 로그인한 사용자 정보 가져오기 */
  async function fetchUserProfile() {
    console.log("✅ fetchUserProfile() 실행됨");
  
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      console.warn("⚠️ 로그인되지 않은 사용자입니다.");
      return;
    }
  
    try {
      const response = await fetch("http://127.0.0.1:8000/profile/me/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
      }
  
      const userData = await response.json();
      const username = userData.username || "익명"; // 닉네임이 없으면 기본값 설정
  
      console.log("📌 로그인한 사용자 닉네임:", username);
  
      // ✅ "닉네임" 부분 업데이트
      document
        .querySelectorAll(".cmt_writer_nickname strong")
        .forEach((el) => (el.innerText = username));
    } catch (error) {
      console.error("❌ 사용자 정보 불러오기 실패:", error);
    }
  }
  