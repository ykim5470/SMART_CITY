const paging = {
    makeArray: function (base, current, totalPg, path) {
      let start = current % 10 == 0 ? Math.floor((current - 1) / 10) * 10 + 1 : Math.floor(current / 10) * 10 + 1; // 페이징 시작 번호
      let end = current % 10 == 0 ? Math.ceil((current - 1) / 10) * 10 : Math.ceil(current / 10) * 10; // 페이징 끝 번호
      if (end > totalPg) {
        end = totalPg;
      }
      let pageArray = []; // 페이징 번호 담는 배열
      let newPath = "";
      for (var i = start; i <= end; i++) {
        if (path.indexOf("?page=") > -1) {
          newPath = path.replace("page=" + current, "page=" + i); // 현재경로를 해당 페이징 넘버 경로로 바꾸기
        } else {
          newPath = `${base}?page=${i}&limit=10`;
        }
        pageArray.push({
          number: i,
          url: newPath,
        });
      }
      return pageArray;
    },
  };


  module.exports = paging