// src/components/Posts/CommentList.js
import React from 'react';
import '../../styles/CommentList.css';

function CommentList({ comments }) {
  if (!comments || comments.length === 0) {
    return <p className="commentlist-no">Aucun commentaire.</p>;
  }

  return (
    <ul className="commentlist">
      {comments.map(comment => (
        <li key={comment.id}>
          {comment.content} <em>– {comment.author || 'Anonyme'}</em>
        </li>
      ))}
    </ul>
  );
}

export default CommentList;
