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
  find: jest.fn().mockReturnValue(new Promise((res) => res([ARTICLE]))),
  findOne: jest.fn().mockReturnValue(new Promise((res) => res(ARTICLE))),
  findOneBy: jest.fn().mockReturnValue(new Promise((res) => res(ARTICLE))),
};

export const CommentRepoMock = {
  save: async (e: any) => e,
  findOne: jest.fn().mockReturnValue(new Promise((res) => res(COMMENT))),
  findOneBy: jest.fn().mockReturnValue(new Promise((res) => res(COMMENT))),
  update: jest.fn().mockReturnValue(new Promise((res) => res({ affected: 1 }))),
  softRemove: jest.fn().mockReturnValue(new Promise((res) => res(true))),
  createQueryBuilder: jest.fn().mockReturnValue({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockReturnValue(new Promise((res) => res([ARTICLE_WITH_RELATED]))),
  }),
};

export const ReplyRepoMock = {
  save: async (e: any) => e,
  findOneBy: jest.fn().mockReturnValue(new Promise((res) => res(REPLY))),
  update: jest.fn().mockReturnValue(new Promise((res) => res({ affected: 1 }))),
  softRemove: jest.fn().mockReturnValue(new Promise((res) => res(true))),
};

export const EntityManagerMock = {
  transaction: jest.fn().mockReturnValue(new Promise((res) => res(true))),
};

export const S3ServiceMock = {
  upload: jest.fn().mockReturnValue(new Promise((res) => res({ uploaded: [], failed: [] }))),
};
