import React from "react";

function GroupComment({ author, text }) {
    return(
       <div className="group-comment">
        <div className="user-info">
            <img
            src="https://www.gravatar.com/avatar/a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0?s=50"
            alt={`${author} Avatar`}
            className="avatar"
            />
            <div className="name-and-timestamp-wrapper">
                <div className="name">{author}</div>
            </div>
        </div>
        <div className="comment-text">
            {text}
        </div>
        <div className="comment-actions">
            <span>+ Comment</span>
            <button className="primary-button">I'm in!</button>
        </div>
       </div>
    );
}
export default GroupComment;