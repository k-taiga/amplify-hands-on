import { generateClient} from 'aws-amplify/api';
import { useEffect, useState } from 'react';
// GraphQLのMutationとQueryをインポート
import { createTodo } from '../graphql/mutations';
import { listTodos } from '../graphql/queries';
import { getCurrentUser } from '@aws-amplify/auth';
import { uploadData, getUrl } from 'aws-amplify/storage';
import { S3 } from './S3';

const API = generateClient();

export function DynamoDB() {
  // 1. Todo一覧の初期値
  const [todos, setTodos] = useState([]);
  // 2. 入力フォームの初期値
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);

  //コンポーネント初回マウント時にTodo一覧を取得する
  useEffect(() => {
    fetchTodos();
  }, []);

  /**
   * Todo一覧を取得する非同期関数
   */
  async function fetchTodos() {
    try {
      const response = await API.graphql({
        query: listTodos
      });
      const todosData = response.data.listTodos.items;
			// 取得データをstateに保存
      setTodos(todosData);
    } catch (error) {
      console.error('Todo一覧の取得に失敗:', error);
    }
  }

  async function checkUser() {
    try {
      const user = await getCurrentUser();
      console.log('サインインしているユーザー:', user);
    } catch (err) {
      console.error('ユーザーがサインインしていません:', err);
    }
  }

  /**
   * 入力フォーム (Title) の値を変えた時のハンドラ
   */
  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  /**
   * 入力フォーム (Description) の値を変えた時のハンドラ
   */
  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleImageChange = (event) => {
    setImage(event.target.files[0]);
  }

  /**
   * フォーム送信時に、新しいTodoをDynamoDBに保存し、最新一覧を再取得
   */
  const handleSubmit = async (event) => {
    // フォーム本来のsubmit動作（ページリロード）を防ぐ
    event.preventDefault();

    try {
      // 画像をS3にアップロード
      const stored = await uploadData({key: image.name, data: image});
      console.log('画像をアップロードしました:', stored);

      // 入力されたTitleとDescriptionをまとめたオブジェクト
      const todoDetails = {
        title,
        description,
        image: stored.result.key
      };

      await checkUser();

      // GraphQLの createTodo ミューテーションを呼び出し、DynamoDBに新規登録
      const newTodo = await API.graphql({
        query: createTodo,
        variables: { input: todoDetails },
      });

      console.log('新しいTodoを作成しました:', newTodo);
      alert('投稿に成功しました！');

      // 作成完了後、最新のTodo一覧を再取得して画面に反映
      fetchTodos();
    } catch (error) {
      console.error('Todoの投稿に失敗しました', error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Title:
          {/* titleの入力欄: ユーザーが入力したらhandleTitleChangeを呼ぶ */}
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
          />
        </label>
        <br />
        <label>
          Image:
          <input type="file" onChange={handleImageChange} />
        </label>
        <label>
          Description:
          {/* descriptionの入力欄 */}
          <input
            type="text"
            value={description}
            onChange={handleDescriptionChange}
          />
        </label>
        <br />
        {/* フォーム送信ボタン */}
        <button type="submit">Create Post</button>
      </form>

      {/* Todo一覧の表示部分 */}
      <ol>
        {todos.map((todo) => (
          <li key={todo.id}>
            <S3 image={todo.image} title={todo.title} description={todo.description} />
          </li>
        ))}
      </ol>
    </div>
  );
}
