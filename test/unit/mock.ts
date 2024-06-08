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

export const UserRepoMock = {
  find: jest.fn().mockReturnValue([ALICE]),
};

export const ArticleRepoMock = {
  save: async (e: any) => e,
  find: jest.fn().mockReturnValue([ARTICLE]),
  findOne: jest.fn().mockReturnValue(ARTICLE),
  findOneBy: jest.fn().mockReturnValue(ARTICLE),
};

export const CommentRepoMock = {
  findOne: jest.fn().mockReturnValue(COMMENT),
  findOneBy: jest.fn().mockReturnValue(COMMENT),
  update: jest.fn().mockReturnValue({ affected: 1 }),
  softRemove: jest.fn().mockReturnValue(new Promise((res) => res(true))),
  createQueryBuilder: jest.fn().mockReturnValue({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockReturnValue([ARTICLE_WITH_RELATED]),
  }),
};

export const ReplyRepoMock = {
  findOneBy: jest.fn().mockReturnValue(REPLY),
  update: jest.fn().mockReturnValue({ affected: 1 }),
};

export const EntityManagerMock = {
  transaction: jest.fn().mockReturnValue(new Promise((res) => res(true))),
};

export const S3ServiceMock = {
  upload: jest.fn().mockReturnValue({ uploaded: [], failed: [] }),
};
