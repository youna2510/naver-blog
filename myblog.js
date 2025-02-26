document.addEventListener("DOMContentLoaded", function () {
  const toggleButton = document.getElementById("toggle-comment-btn");
  const commentSection = document.getElementById("comment-section");

  toggleButton.addEventListener("click", function () {
    if (commentSection.style.display === "none") {
      commentSection.style.display = "block";
    } else {
      commentSection.style.display = "none";
    }
  });
});

document.addEventListener("DOMContentLoaded", async function () {
  try {
    // ✅ 프로필 API에서 `urlname` 가져오기
    const profileResponse = await fetch("http://127.0.0.1:8000/profile/me/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "Content-Type": "application/json",
      },
    });

    if (!profileResponse.ok) {
      throw new Error(
        `❌ 프로필 정보를 가져오는 데 실패했습니다. (HTTP ${profileResponse.status})`
      );
    }

    const profileData = await profileResponse.json();
    console.log("📢 프로필 데이터:", profileData);

    const urlname = profileData.urlname; // ✅ `urlname` 값 가져오기
    console.log("📌 가져온 URLNAME:", urlname);

    // ✅ `urlname`을 이용해서 카테고리 데이터 가져오기
    fetchCategories(urlname);
  } catch (error) {
    console.error("❌ 프로필 정보를 가져오는 중 오류 발생:", error);
  }
});

// ✅ 카테고리 데이터를 가져오는 함수
async function fetchCategories(urlname) {
  try {
    const response = await fetch(
      `http://127.0.0.1:8000/category/?urlname=${encodeURIComponent(urlname)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error(
        `❌ 카테고리 데이터를 불러오는 데 실패했습니다. (상태 코드: ${response.status})`
      );
      return;
    }

    const categories = await response.json();
    console.log("📢 카테고리 목록 데이터:", categories);

    // ✅ 카테고리 UI 업데이트
    updateCategoryUI(categories);
  } catch (error) {
    console.error("❌ 카테고리 데이터를 가져오는 중 오류 발생:", error);
  }
}

// ✅ UI 업데이트 함수
function updateCategoryUI(categories) {
  const categoryListContainer = document.getElementById("categoryList");

  if (!categoryListContainer) {
    console.error("❌ 'categoryList' 요소를 찾을 수 없습니다.");
    return;
  }

  categoryListContainer.innerHTML = ""; // 기존 목록 초기화

  if (!categories || categories.length === 0) {
    categoryListContainer.innerHTML = "<li>카테고리가 없습니다.</li>";
    return;
  }

  // ✅ "전체보기"와 "게시판" 먼저 추가
  const sortedCategories = ["전체보기", "게시판"];

  // ✅ "게시판" 제외하고 id순 정렬 후 추가
  categories
    .sort((a, b) => a.id - b.id)
    .forEach((category) => {
      if (category.name !== "게시판") {
        sortedCategories.push(category.name);
      }
    });

  // ✅ 정렬된 카테고리 리스트를 UI에 추가
  sortedCategories.forEach((name) => {
    const li = document.createElement("li");
    li.textContent = name;
    li.style.display = "block"; // 한 줄씩 나오도록 설정
    categoryListContainer.appendChild(li);
  });
}

document.addEventListener("DOMContentLoaded", async function () {
  console.log("✅ 댓글 모듈 로드 시작");

  try {
    const response = await fetch("comment.html"); // comment.html 불러오기
    if (!response.ok) {
      throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
    }

    const htmlText = await response.text();
    const commentSection = document.getElementById("comment-section");

    // 1️⃣ comment.html의 내용을 comment-section에 삽입
    commentSection.innerHTML = htmlText;

    console.log("✅ comment.html 로드 성공");

    // 2️⃣ 동적으로 삽입된 <script> 태그를 찾아 실행
    commentSection.querySelectorAll("script").forEach((script) => {
      const newScript = document.createElement("script");
      newScript.textContent = script.textContent; // 스크립트 복사
      document.body.appendChild(newScript); // 실행
      script.remove();
    });

    console.log("✅ comment.html 내부 스크립트 실행 완료");
  } catch (error) {
    console.error("❌ 댓글 모듈 로드 실패:", error);
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const editButton = document.querySelector(".edit_post"); // 수정 버튼 선택
  if (editButton) {
    editButton.addEventListener("click", function () {
      const postTitleElement = document.querySelector(".post_title"); // 게시물 제목 요소 찾기
      if (!postTitleElement) {
        alert("게시물을 찾을 수 없습니다.");
        return;
      }

      const postId = postTitleElement.getAttribute("data-post-id"); // 게시물 ID 가져오기
      if (postId) {
        window.location.href = `write_edit.html?id=${postId}`; // 수정 페이지로 이동
      } else {
        alert("게시물 ID를 찾을 수 없습니다.");
      }
    });
  }
});

document.addEventListener("DOMContentLoaded", async function () {
  const accessToken = localStorage.getItem("access_token");
  if (!accessToken) {
    alert("로그인이 필요합니다.");
    window.location.href = "login.html";
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

    if (response.status === 200) {
      const data = await response.json();
      const nickname = data.username || "익명"; // 닉네임 가져오기
      const profilePic = data.user_pic || "assets/profile.png"; // 프로필 사진 가져오기\
      const blogname = data.blog_name || "블로그 제목";
      const intro = data.intro || "프로필 소개글";

      // 🔥 닉네임 변경
      document.querySelectorAll(".user-nickname").forEach((el) => {
        el.innerText = nickname;
      });

      // 🔥 프로필 사진 변경
      document.querySelectorAll(".user-profilepicture").forEach((img) => {
        img.src = profilePic;
      });

      document.querySelectorAll(".itemtitlefont").forEach((e2) => {
        e2.innerText = blogname;
      });

      document.querySelectorAll(".itemfont_col").forEach((e3) => {
        e3.innerText = intro;
      });
    } else {
      alert("사용자 정보를 불러올 수 없습니다.");
      console.log("❌ 응답 상태 코드:", response.status);
    }
  } catch (error) {
    console.error("❌ 서버 연결 오류:", error);
    alert("서버 연결에 실패했습니다.");
  }
});

document.addEventListener("DOMContentLoaded", function () {});

function popup() {
  var url = "./neighbor_request.html";
  var name = "_blank";
  var option = "width=480, height=300, top=100, left=200, location=no";
  window.open(url, name, option);
}

function cleanUpCaptions(htmlContent) {
  // 1️⃣ 임시 div를 생성하고 HTML을 삽입 (DOM 파싱)
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlContent;

  // 2️⃣ 모든 figcaption 내부의 input 태그를 찾아 변환
  tempDiv.querySelectorAll("figcaption input").forEach((input) => {
    const captionText = document.createTextNode(input.value.trim() || ""); // 입력값을 일반 텍스트로 변환
    const parentFigcaption = input.parentNode; // 부모 figcaption 찾기

    parentFigcaption.innerHTML = ""; // 기존 내용 제거
    parentFigcaption.appendChild(captionText); // 텍스트 삽입
  });

  // 3️⃣ 수정된 HTML 반환
  return tempDiv.innerHTML;
}

function fixImageUrls(htmlContent) {
  const baseUrl = "http://127.0.0.1:8000"; // Django 백엔드 URL

  // 1️⃣ HTML을 파싱하여 DOM 객체로 변환
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlContent;

  // 2️⃣ 모든 img 태그를 찾아 URL 수정
  tempDiv.querySelectorAll("img").forEach((img) => {
    const imgSrc = img.getAttribute("src"); // 속성값 가져오기

    if (imgSrc && !imgSrc.startsWith("http")) {
      // 절대 경로가 아닌 경우만 변환
      img.src = baseUrl + imgSrc;
    }
  });

  // 3️⃣ 수정된 HTML 반환
  return tempDiv.innerHTML;
}

function removeUnnecessaryButtons(htmlContent) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlContent;

  // 1️⃣ 모든 "대표사진 선택" 버튼 삭제
  tempDiv.querySelectorAll("button").forEach((button) => {
    if (button.textContent.trim() === "대표사진 선택") {
      button.remove();
    }
  });

  return tempDiv.innerHTML;
}

async function fetchRecentPost() {
  // ✅ URL에서 n 값 가져오기 (기본값 1)
  const urlParams = new URLSearchParams(window.location.search);
  const n = urlParams.get("n") || 1; // `n` 값이 없으면 기본값 1

  // ✅ 백엔드 API 요청 URL에 n 값을 반영
  const url = `http://127.0.0.1:8000/posts/me/recent/?n=${n}`;

  const accessToken = localStorage.getItem("access_token");
  if (!accessToken) {
    alert("로그인이 필요합니다.");
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    const result = await response.json();

    if (response.ok) {
      const {
        id,
        title,
        content,
        total_likes,
        created_at,
        category_name,
        images,
      } = result;

      console.log("📌 가져온 게시물 ID:", id);

      const formattedDate = new Date(created_at)
        .toLocaleString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
        .replace(/\./g, "")
        .replace(" ", ". ")
        .replace("오전", "")
        .replace("오후", "")
        .trim();

      document.querySelector(".post_title").textContent = title;
      document.querySelector(".post_title").setAttribute("data-post-id", id);

      // ✅ 본문 정리
      let cleanedContent = cleanUpCaptions(content);
      cleanedContent = fixImageUrls(cleanedContent);
      cleanedContent = removeUnnecessaryButtons(cleanedContent);

      // ✅ 이미지 태그를 figure 태그로 변환하여 캡션 추가
      if (images && images.length > 0) {
        images.forEach((imageData) => {
          const { image_url, caption } = imageData;
          const captionText = caption ? caption : ""; // 캡션이 없는 경우 빈 문자열 처리

          // ✅ 기존 <img> 태그를 figure + figcaption으로 교체
          const imageTag = `
      <figure style="text-align: center; margin: 15px 0px;">
        <img src="${image_url}" class="editable-image" 
             style="max-width: 300px; height: auto; margin-top: 10px; border-radius: 5px;">
        <figcaption style="font-size: 12px; color: gray; margin-top: 5px; text-align: center;">
          ${captionText}
        </figcaption>
      </figure>
    `;

          cleanedContent = cleanedContent.replace(
            new RegExp(`<img[^>]*src=["']${image_url}["'][^>]*>`, "g"),
            imageTag
          );
        });
      }

      // ✅ 최종 정리된 HTML 본문 삽입
      document.querySelector(".post_contents").innerHTML = cleanedContent;

      document.querySelector(".heart_list").textContent = `공감 ${total_likes}`;
      document.querySelector(".post_writer_list a").textContent = formattedDate;
      document.querySelector(
        ".post_category"
      ).textContent = `[${category_name}]`;
    } else {
      alert(result.error || "게시물 데이터를 불러오는 데 실패했습니다.");
    }
  } catch (error) {
    console.error("📌 게시물 데이터 가져오기 오류:", error);
    alert("게시물 데이터를 불러오는 중 오류가 발생했습니다.");
  }
}

// ✅ "전체보기 X개의 글" 업데이트하는 함수 추가
async function fetchPostCount() {
  const blogOwnerUrlname = "123"; // 🔥 URL name (동적으로 설정할 필요 있음)
  const url = `http://127.0.0.1:8000/posts/count/${blogOwnerUrlname}/`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: localStorage.getItem("access_token")
          ? `Bearer ${localStorage.getItem("access_token")}`
          : "",
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (response.ok) {
      const postCount = result.post_count; // ✅ 게시물 개수 가져오기
      console.log("📌 게시물 개수:", postCount);

      // ✅ "전체보기 X개의 글" 부분 업데이트
      document.querySelector(
        ".post_list_title strong"
      ).textContent = `전체보기 ${postCount}개의 글`;
    } else {
      console.error("❌ 게시물 개수 가져오기 실패:", result);
    }
  } catch (error) {
    console.error("❌ 게시물 개수 가져오는 중 오류 발생:", error);
  }
}

// ✅ 페이지네이션 버튼 클릭 이벤트 추가
document.addEventListener("DOMContentLoaded", function () {
  const paginationLinks = document.querySelectorAll(".pagination .num");

  paginationLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
      event.preventDefault(); // 기본 링크 이동 방지
      const n = this.textContent.trim(); // 클릭한 숫자 (n번째 게시물)

      console.log(`📌 선택된 게시물 번호: ${n}`);

      // n번째 최신 게시물 가져오기
      fetchRecentPost(n);
    });
  });

  // 기본적으로 가장 최신 게시물(n=1) 조회
  fetchRecentPost();

  // ✅ "전체보기 X개의 글" 데이터 업데이트
  fetchPostCount();
});

document.addEventListener("DOMContentLoaded", async function () {
  try {
    // ✅ 현재 로그인된 사용자 정보 가져오기
    const profileResponse = await fetch("http://127.0.0.1:8000/profile/me/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "Content-Type": "application/json",
      },
    });

    if (!profileResponse.ok) {
      console.error("❌ 프로필 정보 불러오기 실패:", profileResponse.status);
      return;
    }

    const profileData = await profileResponse.json();
    const loggedInUrlname = profileData.urlname; // ✅ 로그인된 사용자의 urlname 가져오기
    const username = profileData.username;

    if (!loggedInUrlname) {
      console.error("❌ urlname을 찾을 수 없음.");
      return;
    }

    // ✅ 이웃 목록 가져오기
    const neighborsResponse = await fetch(
      `http://127.0.0.1:8000/profile/${loggedInUrlname}/neighbors/`
    );
    if (!neighborsResponse.ok) {
      console.error("❌ 이웃 목록 불러오기 실패:", neighborsResponse.status);
      return;
    }
    const neighborsData = await neighborsResponse.json();
    const neighbors = neighborsData.neighbors;

    // ✅ 전체 이웃 수 가져오기
    const countResponse = await fetch(
      `http://127.0.0.1:8000/neighbors/count/${loggedInUrlname}/`
    );
    if (!countResponse.ok) {
      console.error("❌ 이웃 수 불러오기 실패:", countResponse.status);
      return;
    }
    const countData = await countResponse.json();
    const neighborCount = countData.neighbor_count;

    document.getElementById("neighbor-count").innerText = neighborCount;
    document.getElementById(
      "neighbor-new-posts"
    ).innerText = `${username}님 이웃의 새글 보기 >`;

    // ✅ 이웃 리스트 페이지네이션 적용
    const neighborContainer = document.getElementById("neighbor-container");
    const pageIndicator = document.getElementById("page-indicator");
    const prevPageBtn = document.getElementById("prev-page");
    const nextPageBtn = document.getElementById("next-page");

    let currentPage = 1;
    const itemsPerPage = 12; // ✅ 한 페이지당 3명 x 4줄 = 12명
    const totalPages = Math.ceil(neighbors.length / itemsPerPage);

    function renderNeighbors(page) {
      neighborContainer.innerHTML = "";
      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const pageNeighbors = neighbors.slice(start, end);

      pageNeighbors.forEach((neighbor) => {
        const { urlname, username, user_pic } = neighbor;
        const imageUrl = user_pic.startsWith("/media")
          ? `http://127.0.0.1:8000${user_pic}`
          : user_pic;

        // ✅ 로그인된 사용자와 같으면 `myblog.html`, 다르면 `blog.html?urlname=XXX`
        const targetPage =
          loggedInUrlname === urlname
            ? "myblog.html"
            : `blog.html?urlname=${encodeURIComponent(urlname)}`;

        const neighborHtml = `
              <div class="neighbor-item" style="text-align: center;">
                  <a href="${targetPage}">
                      <div class="neighbor-img">
                          <img src="${imageUrl}" alt="${username}" style="cursor: pointer;">
                      </div>
                  </a>
                  <a href="${targetPage}" style="text-decoration: none; color: inherit;">
                      <span class="neighbor-nickname" style="cursor: pointer;">${username}</span>
                  </a>
              </div>
          `;
        neighborContainer.innerHTML += neighborHtml;
      });

      pageIndicator.innerText = `${currentPage} / ${totalPages}`;
    }

    prevPageBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        renderNeighbors(currentPage);
      }
    });

    nextPageBtn.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderNeighbors(currentPage);
      }
    });

    renderNeighbors(currentPage);
  } catch (error) {
    console.error("❌ 서버 연결 오류:", error);
  }
});

// ✅ 카테고리 데이터를 가져오는 함수
async function fetchCategories(urlname) {
  try {
    const response = await fetch(
      `http://127.0.0.1:8000/category/?urlname=${encodeURIComponent(urlname)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error(
        `❌ 카테고리 데이터를 불러오는 데 실패했습니다. (상태 코드: ${response.status})`
      );
      return;
    }

    const data = await response.json();
    console.log("📢 카테고리 목록 데이터:", data);

    // ✅ 카테고리 UI 업데이트
    updateCategoryUI(data);
  } catch (error) {
    console.error("❌ 카테고리 데이터를 가져오는 중 오류 발생:", error);
  }
}

// ✅ UI 업데이트 함수 (기존 방식 반영)
function updateCategoryUI(categories) {
  const categoryListContainer = document.getElementById("categoryList");

  if (!categoryListContainer) {
    console.error("❌ 'categoryList' 요소를 찾을 수 없습니다.");
    return;
  }

  categoryListContainer.innerHTML = ""; // 기존 목록 초기화

  if (!categories || categories.length === 0) {
    categoryListContainer.innerHTML = "<li>카테고리가 없습니다.</li>";
    return;
  }

  // ✅ "전체보기"와 "게시판" 먼저 추가
  const sortedCategories = ["전체보기", "게시판"];

  // ✅ "게시판" 제외하고 id순 정렬 후 추가
  categories
    .sort((a, b) => a.id - b.id)
    .forEach((category) => {
      if (category.name !== "게시판") {
        sortedCategories.push(category.name);
      }
    });

  // ✅ 정렬된 카테고리 리스트를 UI에 추가
  sortedCategories.forEach((name) => {
    const li = document.createElement("li");
    li.textContent = name;
    li.style.display = "block"; // 한 줄씩 나오도록 설정
    categoryListContainer.appendChild(li);
  });
}

//좋아요 기능
