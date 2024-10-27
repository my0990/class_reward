import { atom } from "recoil";

//atom({key:, default:})로 새로운 아톰을 만들 수 있다.
// 이때 key는 각 아톰을 구별하는 고유한 식별자이다.
// default는 initial state를 의미한다.
export const userDataState = atom({
  key: "user data",
  default: null,
});

export const sessionDataState = atom({
  key: "session",
  default: null,
});

export const thermometerDataState = atom({
  key: "thermometer",
  default: null,
})

export const stepDataState = atom({
  key: "step data",
  default: {menu: 'home', step: null}
});

export const requestDataState = atom({
  key: "kiosk request data",
  default: { itemData: null, userId: null, userMoney: null , userName: null, checked: false, itemEmoji: null}
})

export const studentDataState = atom({
  key: "student data",
  default: []
})