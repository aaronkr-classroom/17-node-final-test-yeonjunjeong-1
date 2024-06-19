// controllers/discussionsController.js
"use strict";

const Discussion = require("../models/Discussion"), // 사용자 모델 요청
  getDiscussionParams = (body, user) => {
    return {
      title: body.title,
      description: body.description,
      author: user,
      category: body.category,
      tags: body.tags,
    };
  };

module.exports = {
  /**
   * =====================================================================
   * C: CREATE / 생성
   * =====================================================================
   */
  // 1. new: 액션,
  new: (req, res) => {
    res.render("discussions/new", {
      page: "new-user",
      title: "New User",
    });
  },

  // 2. create: 액션,
  create: (req, res, next) => {
    let discussionParams = getDiscussionParams(req.body, req.user);
    Discussion.create(discussionParams)
      .then(discussion => {
        res.locals.redirect = "/discussions";
        res.locals.discussion = discussion;
        next();
      })
      .catch(error => {
        console.log(`Error saving discussion: ${error.message}`);
        next(error);
      });
  },

  // 3. redirectView: 액션,
  redirectView: (req, res, next) => {
    let redirectPath = res.locals.redirect;
    if (redirectPath) res.redirect(redirectPath);
    else next();
  },
  /**
   * =====================================================================
   * R: READ / 조회
   * =====================================================================
   */
  /**
   * ------------------------------------
   * ALL records / 모든 레코드
   * ------------------------------------
   */
  // 4. index: 액션,
  index: (req, res, next) => {
    Discussion.find()
      .populate("author")
      .exec()
      .then((discussions) => {
        
        res.locals.discussions = discussions; // 응답상에서 사용자 데이터를 저장하고 다음 미들웨어 함수 호출
        next();
      })
      .catch((error) => {
        // 로그 메시지를 출력하고 홈페이지로 리디렉션
        console.log(`Error fetching discussions: ${error.message}`);
        next(error); // 에러를 캐치하고 다음 미들웨어로 전달
      });
  },

  // 5. indexView: 엑션,
  indexView: (req, res) => {
    res.render("discussions/index", {
      page: "new-user",
      title: "New User",
    }); 
  },
  /**
   * ------------------------------------
   * SINGLE record / 단일 레코드
   * ------------------------------------
   */
  // 6. show: 액션,
  show: (req, res, next) => {
    let discussionID = req.params.id; // request params로부터 사용자 ID 수집
    Discussion.findById(req.params.id)
      .populate("author")
      .populate("comments")
      .then((discussion) => {
        discussion.views++;
        discussion.save();
        next();
      })
      .catch((error) => {
        console.log(`Error fetching discussions hgjklghhlgjhghfjkf: ${error.message}`);
        next(error); // 에러를 로깅하고 다음 함수로 전달
      });
  },
  // 7. showView: 액션,
  showView: (req, res) => {
    res.render("discussions/show", {
      page: "discussion-details",
      title: "Discussion Details",
    });
  },
  /**
   * =====================================================================
   * U: UPDATE / 수정
   * =====================================================================
   */
  // 8. edit: 액션,
  edit: (req, res, next) => {
    Discussion.findById(req.params.id)
      .populate("author")
      .populate("comments")
      .then((discussion) => {
        res.render("discussions/edit", {
          discussion: discussion,
          page: discussion.name,
          title: "Edit Discussion",
        }); // 데이터베이스에서 내 특정 사용자를 위한 편집 페이지 렌더링
      })
      .catch((error) => {
        console.log(`Error fetching discussion by ID: ${error.message}`);
        next(error);
      });
  },
  // 9. update: 액션,
  update: (req, res, next) => {
    let discussionID = req.params.id,
    discussionParams = getDiscussionParams(req.body);

    Discussion.findByIdAndUpdate(discussionID, {
      $set: discussionParams,
    })
    .populate("author")
    .then((discussion) => {
      res.locals.redirect = `/discussions/${discussionID}`;
      res.locals.discussion = discussion;
      next(); // 지역 변수로서 응답하기 위해 사용자를 추가하고 다음 미들웨어 함수 호출
    })
    .catch(error => {
      console.log(`Error updating discussion by ID: ${error.message}`);
      next(error);
    });
  },

  /**
   * =====================================================================
   * D: DELETE / 삭제
   * =====================================================================
   */
  // 10. delete: 액션,
  delete: (req, res, next) => {
    let discussionID = req.params.id;
    Discussion.findByIdAndRemove(discussionID) // findByIdAndRemove 메소드를 이용한 사용자 삭제
      .then(() => {
        res.locals.redirect = "/discussions";
        next();
      })
      .catch((error) => {
        console.log(`Error deleting discussion by ID: ${error.message}`);
        next();
      });
  },
};
