v8ightcorp backend assignment

# Common

요청 처리 중 예외 발생 시 아래 형식의 응답을 반환합니다.

| _field_    | _type_               |
| ---------- | -------------------- |
| message    | string \| string [ ] |
| error      | string               |
| statusCode | number               |

# User, Auth API

## `Post` /users

사용자를 등록합니다.

### Request Body

| _field_  | _type_ | _note_                      |
| -------- | ------ | --------------------------- |
| email    | string |                             |
| password | string |                             |
| name     | number |                             |
| role     | string | 사용자 역할 (admin, normal) |

### Response Body

| _field_ | _type_ | _note_    |
| ------- | ------ | --------- |
| message | string | 처리 결과 |

## `Post` /auth/login

Access, Refresh Token을 발급합니다.

### Request Body

| _field_  | _type_ | _note_ |
| -------- | ------ | ------ |
| email    | string |        |
| password | string |        |

### Response Body

| _field_ | _type_   | _note_ |
| ------- | -------- | ------ |
| token   | TokenSet |        |

```typescript
interface TokenSet {
  access: string;
  refresh: string;
}
```

## `Post` /auth/refresh

Refresh Token을 이용해 인증 토큰을 재발급합니다.

### Request Body

| _field_ | _type_ | _note_        |
| ------- | ------ | ------------- |
| refresh | string | Refresh Token |

### Response Body

| _field_     | _type_ | _note_              |
| ----------- | ------ | ------------------- |
| accessToken | string | 갱신된 Access Token |

# Article API

## `POST` /articles

게시글을 생성합니다.
`images` field의 경우 확장자 필터링이나 용량 제한을 설정하지 않았으니 테스트 시 주의해주세요.

### Request Body (FormData)

| _field_  | _type_   | _note_               |
| -------- | -------- | -------------------- |
| title    | string   | 제목                 |
| category | string   | 분류 (notice, qna)   |
| content  | string   | 본문                 |
| images   | File [ ] | 첨부 사진 (최대 5장) |

### Response Body

| _field_ | _type_ | _note_    |
| ------- | ------ | --------- |
| message | string | 처리 결과 |

## `GET` /articles/:id

단일 게시글을 조회합니다.

### Parmeters

| _field_ | _note_    |
| ------- | --------- |
| id      | 게시글 ID |

### Response Body

| _field_   | _type_   | _note_             |
| --------- | -------- | ------------------ |
| id        | number   | 게시글 ID          |
| category  | string   | 분류 (notice, qna) |
| title     | string   | 제목               |
| content   | string   | 본문               |
| view      | number   | 조회수             |
| createdAt | string   | 작성일             |
| images    | string[] | 첨부 사진          |

## `GET` /articles/search

게시글을 검색합니다.

### Query

| _field_ | _note_                         |
| ------- | ------------------------------ |
| type    | 검색 기준 (all, author, title) |
| keyword | 검색어                         |
| page    | default 1                      |

### Response Body

| _field_  | _type_      | _note_      |
| -------- | ----------- | ----------- |
| articles | ArticleList | 게시글 목록 |

```typescript
type ArticleList = Array<{
  id: number;
  title: string;
  category: string;
  view: number;
  createdAt: string; // Date and Time in UTC (ISO 8601)
}>;
```

## `GET` /articles

게시글 목록을 조회합니다.

### Query

| _field_ | _note_                            |
| ------- | --------------------------------- |
| sort    | 정렬 기준 (latest, best)          |
| period  | 검색 기간 (all, year,month,week ) |
| page    | default 0                         |

### Response Body

| _field_  | _type_      | _note_      |
| -------- | ----------- | ----------- |
| articles | ArticleList | 게시글 목록 |

```typescript
type ArticleList = Array<{
  id: number;
  title: string;
  category: string;
  view: number;
  createdAt: string; // Date and Time in UTC (ISO 8601)
}>;
```

## `PATCH` /articles/:id

게시글을 수정합니다.

### Parmeters

| _field_ | _note_    |
| ------- | --------- |
| id      | 게시글 ID |

### Request Body

| _field_  | _type_  | _note_             |
| -------- | ------- | ------------------ |
| title    | string? | 제목               |
| category | string? | 분류 (notice, qna) |
| content  | string? | 본문               |

## `DELETE` /articles/:id

단일 게시글을 삭제합니다.

### Parmeters

| _field_ | _note_    |
| ------- | --------- |
| id      | 게시글 ID |

### Response Body

| _field_ | _type_ | _note_    |
| ------- | ------ | --------- |
| message | string | 처리 결과 |
