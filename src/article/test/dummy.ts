const ALICE = {
  id: 1,
  email: 'alice@example.com',
  name: 'alice',
  password: '1234',
  role: 'admin',
};

const COMMENT = {
  id: 1,
  author_id: 1,
  content: '샘플 댓글',
  replies: [
    {
      id: 1,
      author_id: 1,
      comment_id: 1,
      content: '샘플 답글 1',
    },
    {
      id: 2,
      author_id: 1,
      comment_id: 1,
      content: '샘플 답글 2',
    },
  ],
};

const REPLY = {
  id: 1,
  author_id: 1,
  comment_id: 1,
  content: '샘플 답글',
};

const ARTICLE = {
  id: 1,
  author_id: 1,
  category: 'notice',
  content: 'asfdasdf',
  createdAt: new Date().toISOString(),
  updatedAt: null,
  deletedAt: null,
};

const ARTICLE_WITH_RELATED = {
  id: 1,
  author: { id: 1, name: 'alice' },
  content: 'article example asdfasdf',
  createdAt: new Date().toISOString(),
  replies: [
    {
      id: 1,
      author: { id: 1, name: 'alice' },
      content: 'sample reply 1',
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      author: { id: 1, name: 'alice' },
      content: 'sample reply 2',
      createdAt: new Date().toISOString(),
    },
  ],
};

export { ALICE, COMMENT, REPLY, ARTICLE, ARTICLE_WITH_RELATED };
