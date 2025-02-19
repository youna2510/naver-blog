// write_topic.js
function saveTopic() {
    const selectedTopic = document.querySelector('input[name="topic"]:checked');
    if (selectedTopic) {
      localStorage.setItem(
        "selectedTopic",
        selectedTopic.nextSibling.textContent.trim()
      );
      window.location.href = "./write_save.html"; // write_save로 이동
    } else {
      alert("주제를 선택해 주세요.");
    }
  }