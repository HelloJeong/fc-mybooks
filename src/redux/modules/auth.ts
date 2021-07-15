import { Action, createActions, handleActions } from "redux-actions";
import { call, put, takeEvery, select } from "@redux-saga/core/effects";
import UserService from "../../services/UserService";
import { AuthState, LoginReqType } from "../../types";
import TokenService from "../../services/TokenService";
import { push } from "connected-react-router";

const initialState: AuthState = {
  token: null,
  loading: false,
  error: null,
};

const prefix = "my-books/auth";

export const { pending, success, fail } = createActions("PENDING", "SUCCESS", "FAIL", { prefix });

// generic : 2번째는 payload의 타입
const reducer = handleActions<AuthState, string>(
  {
    PENDING: (state) => ({ ...state, loading: true, error: null }),
    SUCCESS: (state, action) => ({ token: action.payload, loading: false, error: null }),
    FAIL: (state, action: any) => ({ ...state, loading: false, error: action.payload }),
  },
  initialState,
  { prefix }
);

export default reducer;

// saga

export const { login, logout } = createActions("LOGIN", "LOGOUT", { prefix });
function* loginSaga(action: Action<LoginReqType>) {
  try {
    yield put(pending());
    const token: string = yield call(UserService.login, action.payload);
    TokenService.set(token);
    yield put(success(token));
    yield put(push("/"));
  } catch (error) {
    yield put(fail(new Error(error?.response?.data?.error || "UNKNOWN_ERROR")));
  }
}
function* logoutSaga() {
  try {
    yield put(pending());
    const token: string = yield select((state) => state.auth.token);
    yield call(UserService.logout, token);
    TokenService.set(token);
  } catch (error) {
    // logout은 에러 대응하지 않음
  } finally {
    TokenService.remove();
    yield put(success(null));
  }
}
export function* authSaga() {
  yield takeEvery(`${prefix}/LOGIN`, loginSaga);
  yield takeEvery(`${prefix}/LOGOUT`, logoutSaga);
}
