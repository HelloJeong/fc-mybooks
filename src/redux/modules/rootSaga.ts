import { all } from "@redux-saga/core/effects";
import { authSaga } from "./auth";
import { booksSaga } from "./books";

export default function* rootSaga() {
  yield all([authSaga(), booksSaga()]);
}
