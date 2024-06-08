v8ightcorp backend assignment

# Common

요청 처리 중 예외 발생 시 아래 형식의 응답을 반환합니다.

```typescript
interface ErrorResponse {
  message: string | string[];
  error?: string;
  statusCode?: number;
}
```

# User, Auth API

## `Post` /users

사용자를 등록합니다.

### Request Body

```typescript
interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'normal'; // 관리자, 사용자
}
```

### Response Body

```typescript
interface ResponseBody {
  message: string; // 처리 결과
}
```

## `Post` /auth/login

Access, Refresh Token을 발급합니다.

### Request Body

```typescript
interface LoginRequest {
  email: string;
  password: string;
}
```

### Response Body

```typescript
interface ResponseBody {
  token: {
    access: string;
    refresh: string;
  };
}
```

## `Post` /auth/refresh

Refresh Token을 이용해 인증 토큰을 재발급합니다.

### Request Body

```typescript
interface RefreshRequest {
  refresh: string; // Refresh Token
}
```

### Response Body

```typescript
interface ResponseBody {
  accessToken: string; // 갱신된 Access Token
}
```

# Article API

## `POST` /articles

게시글을 생성합니다. 사진 첨부 기능의 경우 확장자 및 용량 제한을 설정하지 않았으니 테스트 시 주의해주세요.

### Request Body (FormData)

```typescript
interface ArticleRequest {
  title: string; // 제목
  category: 'notice' | 'qna'; // 분류 (공지사항, QnA)
  content: string; // 본문
  images: File[]; // 첨부 사진 (최대 5장)
}
```

### Response Body

```typescript
interface ResponseBody {
  message: string; // 처리 결과
}
```

## `GET` /articles/:id

단일 게시글을 조회합니다.

### Parmeters

```typescript
interface ArticleParameters {
  id: number; // 게시글 ID
}
```

### Response Body

```typescript
interface ArticleResponse {
  id: number;
  category: string;
  title: string;
  content: string;
  view: number;
  createdAt: string; // Date and Time in UTC (ISO 8601)
  images: string[]; // Array of image urls
  comments: Comment[];
}

interface Comment {
  id: number;
  authorId: number;
  authorName: string;
  content: string;
  createdAt: string;
  replies: Reply[];
}

interface Reply {
  id: number;
  authorId: number;
  authorName: string;
  content: string;
  createdAt: string;
}
```

## `GET` /articles/search

게시글을 검색합니다.

### Query

```typescript
interface SearchQuery {
  type: 'all' | 'author' | 'title'; // 검색 기준
  keyword: string; // 검색어, 최소 4글자
  page: number; // 기본값 1
}
```

### Response Body

```typescript
interface SearchResponse {
  articles: Array<{
    id: number;
    title: string;
    category: string;
    view: number;
    createdAt: string; // Date and Time in UTC (ISO 8601)
  }>;
}
```

## `GET` /articles

게시글 목록을 조회합니다.

### Query

```typescript
interface QueryOptions {
  sort: 'latest' | 'best'; // 정렬 기준
  period: 'all' | 'year' | 'month' | 'week'; // 검색 기간
  page: number; // 기본값 0
}
```

### Response Body

```typescript
interface ArticleListResponse {
  articles: Array<{
    id: number;
    title: string;
    category: string;
    view: number;
    createdAt: string;
  }>;
}
```

## `PATCH` /articles/:id

게시글을 수정합니다.

### Parmeters

```typescript
interface Parameters {
  id: number; // 게시글 ID
}
```

### Request Body

```typescript
interface RequestBody {
  title?: string; // 제목
  category?: 'notice' | 'qna'; // 분류 (공지사항, QnA)
  content?: string; // 본문
}
```

### Response Body

```typescript
interface ResponseBody {
  message: string; // 처리 결과
}
```

## `DELETE` /articles/:id

단일 게시글을 삭제합니다.

### Parmeters

```typescript
interface Parameters {
  id: number; // 게시글 ID
}
```

### Response Body

```typescript
interface ResponseBody {
  message: string; // 처리 결과
}
```

# Comment API

## `POST` /articles/:id/comments

댓글을 생성합니다.

### Parameters

```typescript
interface Parameters {
  id: number; // 게시글 ID
}
```

### Request Body

```typescript
interface RequestBody {
  content: string; // 댓글 내용
}
```

### Response Body

```typescript
interface ResponseBody {
  message: string; // 처리 결과
}
```

## `DELETE` /comments/:id

댓글을 삭제합니다.

### Parameters

```typescript
interface Parameters {
  id: number; // 댓글 ID
}
```

### Response Body

```typescript
interface ResponseBody {
  message: string; // 처리 결과
}
```

## `POST` /comments/:id/replies

댓글에 답글을 생성합니다.

### Parameters

```typescript
interface Parameters {
  id: number; // 댓글 ID
}
```

### Request Body

```typescript
interface RequestBody {
  content: string; // 답글 내용
}
```

### Response Body

```typescript
interface ResponseBody {
  message: string; // 처리 결과
}
```
