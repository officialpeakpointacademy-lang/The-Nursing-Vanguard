/* =========================================
   THE NURSING VANGUARD
   COMMUNITY MODULE
========================================= */

const communityPostsContainer =
  document.getElementById("communityPosts");

const communityPostForm =
  document.getElementById("communityPostForm");

const communityPostContent =
  document.getElementById("communityPostContent");

const communityPostCategory =
  document.getElementById("communityPostCategory");

const communityPostButton =
  document.getElementById("communityPostButton");

const communityFormMessage =
  document.getElementById("communityFormMessage");

const refreshCommunityButton =
  document.getElementById("refreshCommunity");


let currentCommunityUser = null;


/* =========================================
   LOAD CURRENT USER
========================================= */

async function loadCommunityUser() {

  try {

    const response = await fetch("/api/auth/me");

    if (!response.ok) {
      window.location.href = "/login.html";
      return;
    }

    const data = await response.json();

    currentCommunityUser =
      data.user ||
      data.member ||
      data.staff ||
      data;

  } catch (error) {

    console.error(
      "Unable to load current user:",
      error
    );

  }

}


/* =========================================
   GET CURRENT USER ID
========================================= */

function getCommunityUserId() {

  if (!currentCommunityUser) {
    return null;
  }

  return (
    currentCommunityUser.memberId ||
    currentCommunityUser.userId ||
    currentCommunityUser.id ||
    currentCommunityUser.staffId ||
    null
  );

}


/* =========================================
   CHECK ADMIN STATUS
========================================= */

function isCommunityAdmin() {

  if (!currentCommunityUser) {
    return false;
  }

  const roles = Array.isArray(
    currentCommunityUser.roles
  )
    ? currentCommunityUser.roles
    : [];

  return roles.some(role =>
    ["admin", "super_admin"].includes(
      String(role).toLowerCase()
    )
  );

}

/* =========================================
   FORMAT POST DATE
========================================= */

function formatCommunityDate(dateValue) {

  if (!dateValue) {
    return "Recently";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);

}


/* =========================================
   CREATE COMMUNITY POST ELEMENT
========================================= */

function createCommunityPost(post) {

  const article = document.createElement("article");

  article.className = "community-post";


  /* POST HEADER */

  const top = document.createElement("div");

  top.className = "community-post-top";


  /* AUTHOR */

  const author = document.createElement("div");

  author.className = "community-author";


  const avatar = document.createElement("div");

  avatar.className = "community-avatar";

  avatar.textContent =
    String(post.authorName || "Member")
      .trim()
      .charAt(0)
      .toUpperCase();


  const authorInfo = document.createElement("div");

  authorInfo.className = "community-author-info";


  const authorName = document.createElement("strong");

  authorName.textContent =
    post.authorName || "Community Member";


  const postDate = document.createElement("span");

  postDate.className = "community-post-date";

  postDate.textContent =
    formatCommunityDate(post.createdAt);


  authorInfo.append(
    authorName,
    postDate
  );

  author.append(
    avatar,
    authorInfo
  );


  /* CATEGORY */

  const category = document.createElement("span");

  category.className = "community-post-category";

  category.textContent =
    post.category || "General";


  top.append(
    author,
    category
  );


  /* POST CONTENT */

  const content = document.createElement("p");

  content.className = "community-post-content";

  content.textContent =
    post.content || "";


  article.append(
    top,
    content
  );


  /* =========================================
   POST ENGAGEMENT
========================================= */

const engagement = document.createElement("div");

engagement.className = "community-post-engagement";


/* LIKE BUTTON */

const likeButton = document.createElement("button");

likeButton.type = "button";

likeButton.className = "community-like-button";

const userId = getCommunityUserId();

const reactions = Array.isArray(post.reactions)
  ? post.reactions
  : [];

const hasReacted = userId !== null &&
  reactions.some(
    id => String(id) === String(userId)
  );

likeButton.classList.toggle(
  "is-reacted",
  hasReacted
);

likeButton.setAttribute(
  "aria-pressed",
  String(hasReacted)
);

likeButton.textContent = hasReacted
  ? "♥ Liked"
  : "♡ Like";


/* REACTION COUNT */

const reactionCount = document.createElement("span");

reactionCount.className = "community-reaction-count";

reactionCount.textContent =
  `${reactions.length} ${
    reactions.length === 1 ? "like" : "likes"
  }`;


/* LIKE BUTTON ACTION */

likeButton.addEventListener("click", () => {

  toggleCommunityReaction(
    post,
    likeButton,
    reactionCount
  );

});


engagement.append(
  likeButton,
  reactionCount
);

article.appendChild(engagement);

/* =========================================
   COMMUNITY COMMENTS
========================================= */

const commentsSection = document.createElement("div");

commentsSection.className = "community-comments";


/* COMMENTS HEADING */

const commentsHeading = document.createElement("h4");

commentsHeading.className = "community-comments-heading";

const comments = Array.isArray(post.comments)
  ? post.comments
  : [];

commentsHeading.textContent =
  `Comments (${comments.length})`;


/* COMMENTS LIST */

const commentsList = document.createElement("div");

commentsList.className = "community-comments-list";


comments.forEach(comment => {

  const commentItem = document.createElement("div");

  commentItem.className = "community-comment";


  const commentAuthor = document.createElement("strong");

  commentAuthor.className = "community-comment-author";

  commentAuthor.textContent =
    comment.authorName || "Community Member";


  const commentDate = document.createElement("span");

  commentDate.className = "community-comment-date";

  commentDate.textContent =
    formatCommunityDate(comment.createdAt);


  const commentContent = document.createElement("p");

  commentContent.className = "community-comment-content";

  commentContent.textContent =
    comment.content || "";


  const commentMeta = document.createElement("div");

  commentMeta.className = "community-comment-meta";

  commentMeta.append(
    commentAuthor,
    commentDate
  );


   /* DELETE COMMENT BUTTON */

  const currentUserId = getCommunityUserId();

  const isCommentAuthor =
    currentUserId !== null &&
    String(comment.authorId) === String(currentUserId);

  if (isCommentAuthor || isCommunityAdmin()) {

    const deleteCommentButton =
      document.createElement("button");

    deleteCommentButton.type = "button";

    deleteCommentButton.className =
      "community-comment-delete-button";

    deleteCommentButton.textContent =
      "Delete comment";

    deleteCommentButton.addEventListener("click", () => {

      deleteCommunityComment(
        post.id,
        comment.id
      );

    });

    commentItem.appendChild(deleteCommentButton);

  }


  commentItem.append(
    commentMeta,
    commentContent
  );

  commentsList.appendChild(commentItem);

});


/* EMPTY COMMENTS MESSAGE */

if (comments.length === 0) {

  const emptyComments = document.createElement("p");

  emptyComments.className = "community-no-comments";

  emptyComments.textContent =
    "No comments yet. Start the conversation.";

  commentsList.appendChild(emptyComments);

}


/* COMMENT FORM */

const commentForm = document.createElement("form");

commentForm.className = "community-comment-form";


const commentInput = document.createElement("textarea");

commentInput.className = "community-comment-input";

commentInput.placeholder = "Write a comment...";

commentInput.maxLength = 2000;

commentInput.required = true;


const commentButton = document.createElement("button");

commentButton.type = "submit";

commentButton.className = "community-comment-submit";

commentButton.textContent = "Comment";


const commentMessage = document.createElement("span");

commentMessage.className = "community-comment-message";


commentForm.append(
  commentInput,
  commentButton
);


commentForm.addEventListener("submit", async event => {

  event.preventDefault();

  const content = commentInput.value.trim();

  if (!content) {
    return;
  }

  commentButton.disabled = true;

  commentButton.textContent = "Sending...";

  commentMessage.textContent = "";


  try {

    const response = await fetch(
      `/api/community/posts/${encodeURIComponent(post.id)}/comments`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          content
        })
      }
    );


    const data = await response.json();


    if (!response.ok) {

      throw new Error(
        data.message || "Unable to add comment."
      );

    }


    await loadCommunityPosts();


  } catch (error) {

    console.error(
      "Comment submission error:",
      error
    );

    commentMessage.textContent =
      error.message || "Unable to submit comment.";

  } finally {

    commentButton.disabled = false;

    commentButton.textContent = "Comment";

  }

});


commentsSection.append(
  commentsHeading,
  commentsList,
  commentForm,
  commentMessage
);

article.appendChild(commentsSection);

/* =========================================
   DELETE BUTTON
========================================= */

const currentUserId = getCommunityUserId();

const isAuthor =
  currentUserId !== null &&
  String(post.authorId) === String(currentUserId);

if (isAuthor || isCommunityAdmin()) {

  const actions = document.createElement("div");

  actions.className = "community-post-actions";

  const deleteButton = document.createElement("button");

  deleteButton.type = "button";

  deleteButton.className = "community-delete-button";

  deleteButton.textContent = "Delete post";

  deleteButton.addEventListener("click", () => {

    deleteCommunityPost(post.id);

  });

  actions.appendChild(deleteButton);

  article.appendChild(actions);

}


  return article;

}


/* =========================================
   LOAD COMMUNITY POSTS
========================================= */

async function loadCommunityPosts() {

  communityPostsContainer.innerHTML = "";

  const loading = document.createElement("div");

  loading.className = "community-loading";

  loading.textContent =
    "Loading community discussions...";

  communityPostsContainer.appendChild(loading);


  try {

    const response = await fetch(
      "/api/community/posts"
    );

    const data = await response.json();


    if (!response.ok) {

      throw new Error(
        data.message || "Unable to load posts."
      );

    }


    const posts = Array.isArray(data.posts)
      ? data.posts
      : [];


    communityPostsContainer.innerHTML = "";


    if (posts.length === 0) {

      const empty = document.createElement("div");

      empty.className = "community-empty";

      empty.textContent =
        "No discussions yet. Be the first to share something with the community!";

      communityPostsContainer.appendChild(empty);

      return;

    }


    posts.forEach(post => {

      const postElement =
        createCommunityPost(post);

      communityPostsContainer.appendChild(
        postElement
      );

    });


  } catch (error) {

    console.error(
      "Community loading error:",
      error
    );

    communityPostsContainer.innerHTML = "";

    const errorMessage =
      document.createElement("div");

    errorMessage.className = "community-error";

    errorMessage.textContent =
      error.message || "Unable to load community posts.";

    communityPostsContainer.appendChild(
      errorMessage
    );

  }

}


/* =========================================
   PUBLISH COMMUNITY POST
========================================= */

communityPostForm.addEventListener(
  "submit",
  async function (event) {

    event.preventDefault();


    const content =
      communityPostContent.value.trim();

    const category =
      communityPostCategory.value;


    if (!content) {

      communityFormMessage.textContent =
        "Please write something before publishing.";

      return;

    }


    communityPostButton.disabled = true;

    communityPostButton.textContent =
      "Publishing...";

    communityFormMessage.textContent = "";


    try {

      const response = await fetch(
        "/api/community/posts",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            content,
            category
          })
        }
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data.message || "Unable to publish post."
        );

      }


      communityPostContent.value = "";

      communityPostCategory.value = "General";


      communityFormMessage.textContent =
        "Your post has been published successfully.";


      await loadCommunityPosts();


    } catch (error) {

      console.error(
        "Post publishing error:",
        error
      );

      communityFormMessage.textContent =
        error.message || "Something went wrong.";

    } finally {

      communityPostButton.disabled = false;

      communityPostButton.textContent =
        "Publish Post";

    }

  }
);

/* =========================================
   TOGGLE COMMUNITY POST REACTION
========================================= */

async function toggleCommunityReaction(
  post,
  likeButton,
  reactionCount
) {

  likeButton.disabled = true;

  try {

    const response = await fetch(
      `/api/community/posts/${encodeURIComponent(post.id)}/reactions`,
      {
        method: "POST"
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to update reaction."
      );
    }

    // Update the post's local reaction data
    if (!Array.isArray(post.reactions)) {
      post.reactions = [];
    }

    const userId = String(getCommunityUserId());

    post.reactions = post.reactions.filter(
      id => String(id) !== userId
    );

    if (data.reacted) {
      post.reactions.push(getCommunityUserId());
    }

    // Update button appearance
    likeButton.classList.toggle(
      "is-reacted",
      data.reacted
    );

    likeButton.setAttribute(
      "aria-pressed",
      String(data.reacted)
    );

    likeButton.textContent = data.reacted
      ? "♥ Liked"
      : "♡ Like";

    // Update reaction count
    reactionCount.textContent =
      `${data.reactionCount} ${
        data.reactionCount === 1 ? "like" : "likes"
      }`;

  } catch (error) {

    console.error(
      "Reaction error:",
      error
    );

    alert(
      error.message || "Unable to update reaction."
    );

  } finally {

    likeButton.disabled = false;

  }

}

/* =========================================
   DELETE COMMUNITY COMMENT
========================================= */

async function deleteCommunityComment(
  postId,
  commentId
) {

  const confirmed = window.confirm(
    "Are you sure you want to delete this comment?"
  );

  if (!confirmed) {
    return;
  }

  try {

    const response = await fetch(
      `/api/community/posts/${encodeURIComponent(postId)}/comments/${encodeURIComponent(commentId)}`,
      {
        method: "DELETE"
      }
    );

    const data = await response.json();

    if (!response.ok) {

      throw new Error(
        data.message || "Unable to delete comment."
      );

    }

    await loadCommunityPosts();

  } catch (error) {

    console.error(
      "Comment deletion error:",
      error
    );

    alert(
      error.message || "Unable to delete comment."
    );

  }

}

/* =========================================
   DELETE COMMUNITY POST
========================================= */

async function deleteCommunityPost(postId) {

  const confirmed = window.confirm(
    "Are you sure you want to delete this post?"
  );

  if (!confirmed) {
    return;
  }


  try {

    const response = await fetch(
      `/api/community/posts/${encodeURIComponent(postId)}`,
      {
        method: "DELETE"
      }
    );


    const data = await response.json();


    if (!response.ok) {

      throw new Error(
        data.message || "Unable to delete post."
      );

    }


    await loadCommunityPosts();


  } catch (error) {

    console.error(
      "Post deletion error:",
      error
    );

    alert(
      error.message || "Unable to delete post."
    );

  }

}


/* =========================================
   REFRESH COMMUNITY
========================================= */

refreshCommunityButton.addEventListener(
  "click",
  loadCommunityPosts
);


/* =========================================
   INITIALIZE COMMUNITY
========================================= */

async function initializeCommunity() {

  await loadCommunityUser();

  await loadCommunityPosts();

}

initializeCommunity();