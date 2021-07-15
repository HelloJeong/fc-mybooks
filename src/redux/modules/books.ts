import {
  put,
  takeLatest,
  select,
  call,
  takeEvery,
} from "@redux-saga/core/effects";
import { BookReqType, BooksState, BookType } from "./../../types";
import { createActions, handleActions, Action } from "redux-actions";
import BookService from "../../services/BookService";
import { push } from "connected-react-router";

const initialState: BooksState = {
  books: null,
  loading: false,
  error: null,
};

const prefix = "my-books/books";

export const { pending, success, fail } = createActions(
  "PENDING",
  "SUCCESS",
  "FAIL",
  { prefix }
);

const reducer = handleActions<BooksState, BookType[]>(
  {
    PENDING: (state) => ({ ...state, loading: true, error: null }),
    SUCCESS: (state, action) => ({
      books: action.payload,
      loading: false,
      error: null,
    }),
    FAIL: (state, action: any) => ({
      ...state,
      loading: false,
      error: action.payload,
    }),
  },
  initialState,
  { prefix }
);

export default reducer;

// saga

export const { getBooks, addBook } = createActions("GET_BOOKS", "ADD_BOOK", {
  prefix,
});

function* getBooksSaga() {
  try {
    yield put(pending());
    const token: string = yield select((state) => state.auth.token);
    const books: BookType[] = yield call(BookService.getBooks, token);
    yield put(success(books));
  } catch (error) {
    yield put(fail(new Error(error?.response?.data?.error || "UNKNOWN_ERROR")));
  }
}

function* addBookSaga(action: Action<BookReqType>) {
  try {
    yield put(pending());
    const token: string = yield select((state) => state.auth.token);
    const book: BookType = yield call(
      BookService.addBook,
      token,
      action.payload
    );
    const books: BookType[] = yield select((state) => state.books.books);
    yield put(success([...books, book]));
    yield put(push("/"));
  } catch (error) {
    yield put(fail(new Error(error?.response?.data?.error || "UNKNOWN_ERROR")));
  }
}

export function* booksSaga() {
  yield takeLatest(`${prefix}/GET_BOOKS`, getBooksSaga); // 중복된 호출 중에는 가장 마지막 것만 가져옴
  yield takeEvery(`${prefix}/ADD_BOOK`, addBookSaga);
}
