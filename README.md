# Wetube 프로젝트

<img src='wetube main.png'/>

## 사이트 주소
https://wetube-ws0671.koyeb.app/

## 목표

youtube를 모티브로 구현한 사이트.

## 사용기술
- html,css
- javascript
- express
- nodeJS

## 구현한 것들

- express를 이용한 wetube 서버 구현
- MVC(model,view,controller)패턴으로 프로젝트 구축
- mongodb를 이용한 db 구축
- 동영상 CRUD
- 댓글 작성 및 삭제
- 로그인, 로그아웃
- session을 사용한 로그인 상태 유지
- 사용자 정보 수정
- 소셜 로그인 구현(깃허브, 카카오, 네이버)
- 유튜브 API를 이용한 동영상 업로드
- 사용자 간의 구독 기능 구현
- local storage를 이용한 menu-bar 조작

## 배운점

- 모달창 만들기.
- 상대 시간 출력 및 새로고침할때마다 갱신.
- 실시간 기능 구현을 위해 백엔드에 코드를 구현하고 프론트에서 동적으로 element를 만들어주는 fake 기법을 사용함.
- 구독자 수를 구하기위해 내가 구독중인 사람들 스키마뿐아니라 나를 구독중인 사람들 스키마도 추가.
- koyeb 배포 사이트 사용하기.
- 실시간으로 댓글 달기, 구독자 수 업데이트 및 구독 기능
- 백엔드에서 req.flash를 이용한 메세지 출력 (성공, 에러 메세지)

## 추가할 기능

- 구글 로그인
- 메뉴 클릭 부드럽지 않은 부분 수정 및 클릭하면 색깔 바뀌게 하기
- 반응형, 모바일 화면 대응