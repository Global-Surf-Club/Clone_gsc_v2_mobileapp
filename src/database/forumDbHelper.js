// database/forumDbHelper.js
import { getDatabase } from './schema';

const ensureDatabase = async () => {
  try {
    const db = await getDatabase();
    if (!db) {
      throw new Error('Database not available');
    }
    return db;
  } catch (error) {
    throw error;
  }
};

export const insertForumPost = async postData => {
  try {
    const db = await ensureDatabase();

    if (!postData || !postData.id) {
      return false;
    }

    const {
      id,
      userId,
      title = '',
      description = '',
      clubId = '-999',
      authorName = '',
      authorImage = '',
      authorInfo = '',
      postImages = [],
      commentCount = 0,
      likeCount = 0,
      isLiked = 0,
      createdAt = new Date().toISOString(),
      sync_status = 'synced',
    } = postData;

    await db.executeSql(
      `INSERT OR REPLACE INTO forum_posts 
       (post_id, user_id, title, description, club_id, author_name, 
        author_image, author_info, image_count, comment_count, 
        like_count, is_liked, created_at, updated_at, sync_status, data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, ?)`,
      [
        String(id),
        String(userId || ''),
        String(title),
        String(description),
        String(clubId),
        String(authorName),
        String(authorImage),
        String(authorInfo),
        Number(postImages?.length || 0),
        Number(commentCount || 0),
        Number(likeCount || 0),
        isLiked ? 1 : 0,
        String(createdAt),
        String(sync_status),
        JSON.stringify(postData),
      ],
    );

    // Insert post images
    if (postImages && postImages.length > 0) {
      for (const image of postImages) {
        await insertForumPostImage(id, image);
      }
    }

    return true;
  } catch (error) {
    return false;
  }
};

export const bulkInsertForumPosts = async (posts, pageNo = 1) => {
  try {
    const db = await ensureDatabase();
    if (!Array.isArray(posts)) {
      return false;
    }
    if (pageNo === 1) {
      await db.executeSql('DELETE FROM forum_posts');
      await db.executeSql('DELETE FROM forum_post_images');
    }
    for (const post of posts) {
      await insertForumPost(post);
    }
    return true;
  } catch (error) {
    return false;
  }
};

export const getForumPosts = async (pageNo = 1, perPage = 10) => {
  try {
    const db = await ensureDatabase();
    const offset = (pageNo - 1) * perPage;

    const [results] = await db.executeSql(
      `SELECT * FROM forum_posts 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [perPage, offset],
    );

    const posts = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      try {
        const postData = JSON.parse(row.data);

        // Get post images
        const images = await getForumPostImages(row.post_id);

        posts.push({
          ...postData,
          postImages: images,
          isLike: row.is_liked === 1,
          commentCount: row.comment_count,
          likeCount: row.like_count,
        });
      } catch (e) {}
    }
    return posts;
  } catch (error) {
    return [];
  }
};

export const getForumPost = async postId => {
  try {
    const db = await ensureDatabase();

    if (!postId) {
      return null;
    }

    const [results] = await db.executeSql(
      'SELECT * FROM forum_posts WHERE post_id = ?',
      [String(postId)],
    );

    if (results.rows.length > 0) {
      const row = results.rows.item(0);
      const postData = JSON.parse(row.data);

      // Get post images
      const images = await getForumPostImages(postId);

      return {
        ...postData,
        postImages: images,
        isLike: row.is_liked === 1,
        likeCount: row.like_count,
      };
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const getForumPostById = async postId => {
  try {
    const db = await ensureDatabase();

    const [result] = await db.executeSql(
      `SELECT * FROM forum_posts WHERE post_id = ? LIMIT 1`,
      [String(postId)],
    );

    if (result.rows.length > 0) {
      return result.rows.item(0)?.data;
    }

    return null;
  } catch (error) {
    return null;
  }
};

export const updateForumPost = async (postId, updates) => {
  try {
    const db = await ensureDatabase();

    if (!postId) {
      return false;
    }

    const existingPost = await getForumPost(postId);
    if (!existingPost) {
      return await insertForumPost({ ...updates, id: postId });
    }

    const updatedPost = { ...existingPost, ...updates };
    await insertForumPost(updatedPost);

    await db.executeSql(
      `UPDATE forum_posts 
       SET sync_status = 'pending', updated_at = datetime('now')
       WHERE post_id = ?`,
      [String(postId)],
    );

    return true;
  } catch (error) {
    return false;
  }
};

export const deleteForumPost = async postId => {
  try {
    const db = await ensureDatabase();

    if (!postId) {
      return false;
    }

    // Delete post images first
    await db.executeSql('DELETE FROM forum_post_images WHERE post_id = ?', [
      String(postId),
    ]);

    // Delete post comments
    await db.executeSql('DELETE FROM forum_comments WHERE post_id = ?', [
      String(postId),
    ]);

    // Delete post
    await db.executeSql('DELETE FROM forum_posts WHERE post_id = ?', [
      String(postId),
    ]);

    return true;
  } catch (error) {
    return false;
  }
};

export const updatePostLike = async (postId, isLiked, delta = 1) => {
  try {
    const db = await ensureDatabase();

    if (!postId) {
      return false;
    }

    await db.executeSql(
      `UPDATE forum_posts 
       SET like_count = MAX(0, like_count + ?),
           is_liked = ?,
           updated_at = datetime('now')
       WHERE post_id = ?`,
      [delta, isLiked ? 1 : 0, String(postId)],
    );

    return true;
  } catch (error) {
    return false;
  }
};

export const updatePostLikepostDetail = async (postId, isLiked, delta = 1) => {
  try {
    const db = await ensureDatabase();

    if (!postId) return false;

    const [result] = await db.executeSql(
      `SELECT * FROM forum_post_details WHERE post_id = ?`,
      [String(postId)],
    );

    if (result.rows.length > 0) {
      const row = result.rows.item(0);
      let detailData = JSON.parse(row.data);

      const newLikeCount = Math.max(0, (detailData.likeCount || 0) + delta);

      detailData = {
        ...detailData,
        likeCount: newLikeCount,
        isLike: isLiked,
      };

      await db.executeSql(
        `UPDATE forum_post_details 
         SET data = ?, updated_at = datetime('now')
         WHERE post_id = ?`,
        [JSON.stringify(detailData), String(postId)],
      );
    }

    return true;
  } catch (error) {
    console.log('updatePostLikeEverywhere error:', error);
    return false;
  }
};

export const updatePostCommentCount = async (postId, delta = 1) => {
  try {
    const db = await ensureDatabase();

    if (!postId) {
      return false;
    }

    await db.executeSql(
      `UPDATE forum_posts 
       SET comment_count = comment_count + ?,
           updated_at = datetime('now')
       WHERE post_id = ?`,
      [delta, String(postId)],
    );

    return true;
  } catch (error) {
    return false;
  }
};

export const insertForumPostImage = async (postId, imageData) => {
  try {
    const db = await ensureDatabase();

    if (!postId || !imageData) {
      return false;
    }

    const { id, imageUrl = '', sync_status = 'synced' } = imageData;

    const finalImageId = id || `img_${postId}_${Date.now()}`;

    await db.executeSql(
      `INSERT OR REPLACE INTO forum_post_images 
       (image_id, post_id, image_url, created_at, sync_status, data)
       VALUES (?, ?, ?, datetime('now'), ?, ?)`,
      [
        String(finalImageId),
        String(postId),
        String(imageUrl),
        String(sync_status),
        JSON.stringify(imageData),
      ],
    );

    return true;
  } catch (error) {
    return false;
  }
};

export const getForumPostImages = async postId => {
  try {
    const db = await ensureDatabase();

    if (!postId) {
      return [];
    }

    const [results] = await db.executeSql(
      'SELECT * FROM forum_post_images WHERE post_id = ? ORDER BY created_at ASC',
      [String(postId)],
    );

    const images = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      try {
        images.push(JSON.parse(row.data));
      } catch (e) {}
    }
    return images;
  } catch (error) {
    return [];
  }
};

export const deleteForumPostImage = async imageId => {
  try {
    const db = await ensureDatabase();

    if (!imageId) {
      return false;
    }

    await db.executeSql('DELETE FROM forum_post_images WHERE image_id = ?', [
      String(imageId),
    ]);

    return true;
  } catch (error) {
    return false;
  }
};

// export const insertForumComment = async (commentData, options = {}) => {
//   try {
//     const db = await ensureDatabase();

//     if (!commentData || !commentData.postId) {
//       return false;
//     }

//     const {
//       id,
//       postId,
//       userId,
//       message = '',
//       authorName = '',
//       authorImage = '',
//       likeCount = 0,
//       isLiked = 0,
//       createdAt = new Date().toISOString(),
//       sync_status = 'synced',
//     } = commentData;

//     const finalCommentId = id || `comment_${Date.now()}`;

//     await db.executeSql(
//       `INSERT OR REPLACE INTO forum_comments
//        (comment_id, post_id, user_id, comment_text, author_name,
//         author_image, like_count, is_liked, created_at, sync_status, data)
//        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         String(finalCommentId),
//         String(postId),
//         String(userId),
//         String(message),
//         String(authorName),
//         String(authorImage),
//         Number(likeCount || 0),
//         isLiked ? 1 : 0,
//         String(createdAt),
//         String(sync_status),
//         JSON.stringify({ ...commentData, id: finalCommentId }),
//       ],
//     );

//     // Update post comment count unless explicitly skipped
//     if (!options.skipPostCount) {
//       await updatePostCommentCount(postId, 1);
//     }

//     return true;
//   } catch (error) {
//     return false;
//   }
// };

export const insertForumComment = async (commentData, options = {}) => {
  try {
    const db = await ensureDatabase();

    if (!commentData || !commentData.postId) {
      return false;
    }

    const {
      id,
      postId,
      userId,
      parentId = 0, // ✅ NEW
      message = '',
      authorName = '',
      authorImage = '',
      likeCount = 0,
      isLike = 0,
      createdAt = new Date().toISOString(),
      sync_status = 'synced',
    } = commentData;

    const finalCommentId = id || `comment_${Date.now()}`;
    const isReply = parentId && parentId !== 0;

    // 🔥 STEP 1: If reply → update parent JSON
    if (isReply) {
      const [result] = await db.executeSql(
        `SELECT * FROM forum_comments WHERE comment_id = ?`,
        [String(parentId)],
      );

      if (result.rows.length > 0) {
        const row = result.rows.item(0);
        const parentData = JSON.parse(row.data);

        const addReplyRecursive = node => {
          if (node.id === parentId) {
            return {
              ...node,
              childComments: [
                ...(node.childComments || []),
                { ...commentData, id: finalCommentId },
              ],
            };
          }

          return {
            ...node,
            childComments: node.childComments?.map(addReplyRecursive) || [],
          };
        };

        const updatedParent = addReplyRecursive(parentData);

        await db.executeSql(
          `UPDATE forum_comments SET data = ? WHERE comment_id = ?`,
          [JSON.stringify(updatedParent), String(parentId)],
        );
      }
    }

    // 🔥 STEP 2: ALWAYS insert flat row (pagination ke liye)
    await db.executeSql(
      `INSERT OR REPLACE INTO forum_comments 
       (comment_id, post_id, user_id, comment_text, author_name, 
        author_image, like_count, is_liked, created_at, sync_status, data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        String(finalCommentId),
        String(postId),
        String(userId),
        String(message),
        String(authorName),
        String(authorImage),
        Number(likeCount || 0),
        isLike ? 1 : 0,
        String(createdAt),
        String(sync_status),
        JSON.stringify({
          ...commentData,
          id: finalCommentId,
          parentId, // ✅ IMPORTANT
        }),
      ],
    );

    // 🔥 STEP 3: Update count
    if (!options.skipPostCount) {
      await updatePostCommentCount(postId, 1);
    }

    return true;
  } catch (error) {
    return false;
  }
};

// export const getForumComments = async (postId, pageNo = 1, perPage = 10) => {
//   try {
//     const db = await ensureDatabase();

//     if (!postId) {
//       return [];
//     }

//     const offset = (pageNo - 1) * perPage;

//     const [results] = await db.executeSql(
//       `SELECT * FROM forum_comments
//        WHERE post_id = ?
//        ORDER BY created_at DESC
//        LIMIT ? OFFSET ?`,
//       [String(postId), perPage, offset],
//     );

//     const comments = [];
//     for (let i = 0; i < results.rows.length; i++) {
//       const row = results.rows.item(i);
//       try {
//         const commentData = JSON.parse(row.data);
//         comments.push({
//           ...commentData,
//           isLike: row.is_liked === 1,
//           likeCount: row.like_count,
//         });
//       } catch (e) {}
//     }
//     return comments;
//   } catch (error) {
//     return [];
//   }
// };

export const getForumComments = async (postId, pageNo = 1, perPage = 10) => {
  try {
    const db = await ensureDatabase();

    if (!postId) {
      return [];
    }

    const offset = (pageNo - 1) * perPage;

    const [results] = await db.executeSql(
      `SELECT * FROM forum_comments 
       WHERE post_id = ?
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [String(postId), perPage, offset],
    );

    const flatComments = [];

    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      try {
        const commentData = JSON.parse(row.data);
        flatComments.push({
          ...commentData,
        });
      } catch (e) {}
    }

    // 🔥 BUILD TREE
    const map = {};
    const roots = [];

    flatComments.forEach(c => {
      map[c.id] = { ...c, childComments: [] };
    });

    flatComments.forEach(c => {
      if (c.parentId && map[c.parentId]) {
        map[c.parentId].childComments.push(map[c.id]);
      } else {
        roots.push(map[c.id]);
      }
    });

    return roots;
  } catch (error) {
    return [];
  }
};

// export const deleteForumComment = async (commentId, postId) => {
//   try {
//     const db = await ensureDatabase();

//     if (!commentId) {
//       return false;
//     }

//     await db.executeSql('DELETE FROM forum_comments WHERE comment_id = ?', [
//       String(commentId),
//     ]);

//     // Update post comment count
//     if (postId) {
//       await updatePostCommentCount(postId, -1);
//     }

//     return true;
//   } catch (error) {
//     return false;
//   }
// };

export const deleteForumComment = async (commentId, postId) => {
  try {
    const db = await ensureDatabase();

    if (!commentId) {
      return false;
    }

    // 🔥 delete flat row
    await db.executeSql('DELETE FROM forum_comments WHERE comment_id = ?', [
      String(commentId),
    ]);

    // 🔥 remove from parent JSON
    const [results] = await db.executeSql(
      `SELECT * FROM forum_comments WHERE post_id = ?`,
      [String(postId)],
    );

    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);

      try {
        let data = JSON.parse(row.data);

        const removeRecursive = node => {
          return {
            ...node,
            childComments:
              node.childComments
                ?.filter(c => c.id !== commentId)
                .map(removeRecursive) || [],
          };
        };

        const updated = removeRecursive(data);

        await db.executeSql(
          `UPDATE forum_comments SET data = ? WHERE comment_id = ?`,
          [JSON.stringify(updated), row.comment_id],
        );
      } catch (e) {}
    }

    // 🔥 update count
    if (postId) {
      await updatePostCommentCount(postId, -1);
    }

    return true;
  } catch (error) {
    return false;
  }
};

export const updateCommentLike = async (commentId, isLike, delta = 1) => {
  try {
    const db = await ensureDatabase();

    const [result] = await db.executeSql(
      `SELECT * FROM forum_comments WHERE comment_id = ?`,
      [String(commentId)],
    );

    if (result.rows.length === 0) return false;

    const row = result.rows.item(0);
    let commentData = JSON.parse(row.data);

    const newLikeCount = Math.max(0, (commentData.likeCount || 0) + delta);

    commentData = {
      ...commentData,
      likeCount: newLikeCount,
      isLike: isLike,
    };

    // 🔥 3. DB update (column + JSON dono)
    await db.executeSql(
      `UPDATE forum_comments 
   SET like_count = ?,
       is_liked = ?,
       data = ?
   WHERE comment_id = ?`,
      [
        newLikeCount,
        isLike ? 1 : 0,
        JSON.stringify(commentData),
        String(commentId),
      ],
    );

    return true;
  } catch (error) {
    return false;
  }
};

export const upsertForumPostDetail = async (postId, data) => {
  try {
    const db = await ensureDatabase();

    if (!postId || !data) return false;

    await db.executeSql(
      `INSERT OR REPLACE INTO forum_post_details 
       (post_id, data, created_at, updated_at)
       VALUES (?, ?, datetime('now'), datetime('now'))`,
      [String(postId), JSON.stringify(data)],
    );

    return true;
  } catch (error) {
    return false;
  }
};

export const getForumPostDetail = async postId => {
  try {
    const db = await ensureDatabase();

    const [result] = await db.executeSql(
      `SELECT * FROM forum_post_details WHERE post_id = ? LIMIT 1`,
      [String(postId)],
    );

    if (result.rows.length > 0) {
      return JSON.parse(result.rows.item(0).data);
    }

    return null;
  } catch (error) {
    return null;
  }
};

export const deleteForumPostDetail = async postId => {
  try {
    const db = await ensureDatabase();

    await db.executeSql(`DELETE FROM forum_post_details WHERE post_id = ?`, [
      String(postId),
    ]);

    return true;
  } catch (error) {
    return false;
  }
};

export const addPendingForumAction = async actionData => {
  try {
    const db = await ensureDatabase();

    const {
      actionType,
      postId = '',
      userId,
      title = '',
      description = '',
      imagesData = null,
      commentId = '',
      commentText = '',
      parentId = '',
    } = actionData;

    await db.executeSql(
      `INSERT INTO pending_forum_actions 
       (action_type, post_id, user_id, title, description, images_data, 
        comment_id, comment_text, parent_id, sync_status, retry_count, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0, datetime('now'), datetime('now'))`,
      [
        String(actionType),
        String(postId),
        String(userId),
        String(title),
        String(description),
        imagesData ? JSON.stringify(imagesData) : null,
        String(commentId),
        String(commentText),
        String(parentId),
      ],
    );

    return true;
  } catch (error) {
    return false;
  }
};

export const getPendingForumActions = async () => {
  try {
    const db = await ensureDatabase();

    const [results] = await db.executeSql(
      `SELECT * FROM pending_forum_actions 
       WHERE sync_status = 'pending' AND retry_count < 3
       ORDER BY created_at ASC`,
    );

    const actions = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      actions.push({
        id: row.id,
        actionType: row.action_type,
        postId: row.post_id,
        userId: row.user_id,
        title: row.title,
        description: row.description,
        imagesData: row.images_data ? JSON.parse(row.images_data) : null,
        commentId: row.comment_id,
        commentText: row.comment_text,
        parentId: row.parent_id,
        retryCount: row.retry_count,
      });
    }
    return actions;
  } catch (error) {
    return [];
  }
};

export const markPendingActionCompleted = async actionId => {
  try {
    const db = await ensureDatabase();

    await db.executeSql(
      `UPDATE pending_forum_actions 
       SET sync_status = 'completed', updated_at = datetime('now')
       WHERE id = ?`,
      [actionId],
    );

    return true;
  } catch (error) {
    return false;
  }
};

export const incrementRetryCount = async actionId => {
  try {
    const db = await ensureDatabase();

    await db.executeSql(
      `UPDATE pending_forum_actions 
       SET retry_count = retry_count + 1, updated_at = datetime('now')
       WHERE id = ?`,
      [actionId],
    );

    return true;
  } catch (error) {
    return false;
  }
};
