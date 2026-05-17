import ApiService from './AxiosInstance';

function createPost(data) {
  return ApiService.withAuth({
    url: `forum/create`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function getPosts(pageNo, pageSize) {
  return ApiService.withAuth({
    // url: `forum/${pageNo}/${pageSize}`,
    url: `forum/${pageNo}/${pageSize}/new`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// function postComment(data) {
//   return ApiService.withAuth({
//     url: `forum/comment/create`,
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     data,
//   });
// }

function postComment(data) {
  console.log('data====>', data);
  return ApiService.withAuth({
    url: `forum/comment/create/multiple`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function getComments(id, pageNo, pageSize) {
  return ApiService.withAuth({
    url: `forum/comment/${id}/${pageNo}/${pageSize}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function postImage(id, data) {
  return ApiService.withAuth({
    url: `forum/image?id=${id}`,
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data`,
    },
    data,
  });
}

function postDetail(id) {
  return ApiService.withAuth({
    url: `forum/${id}`,
    method: 'GET',
    headers: {
      'Content-Type': `multipart/form-data`,
    },
  });
}

function getCommentsReplyes(id, pageNo, pagePerCount) {
  return ApiService.withAuth({
    url: `forum/comment/${id}/replys/${pageNo}/${pagePerCount}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function postCommentLike(id) {
  return ApiService.withAuth({
    url: `forumcomment/${id}/like`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export default {
  createPost,
  getPosts,
  postComment,
  getComments,
  postImage,
  postDetail,
  getCommentsReplyes,
  postCommentLike,
};
