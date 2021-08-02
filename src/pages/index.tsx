/* eslint-disable react-hooks/exhaustive-deps */
import { GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
import { FiUser, FiCalendar } from 'react-icons/fi';
import Link from 'next/link';
import { useState } from 'react';
import { useEffect } from 'react';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { formatDate } from '../utils/formatDate';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

const Home: React.FC<HomeProps> = ({ postsPagination, preview }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPage, setNewPage] = useState<string | null>(null);

  useEffect(() => {
    setPosts(postsPagination.results);
    setNewPage(postsPagination.next_page);
  }, []);

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleLoadPosts = () => {
    if (newPage) {
      fetch(postsPagination.next_page)
        .then(response => response.json())
        .then(data => {
          setNewPage(data.next_page);

          data.results.forEach(response => {
            setPosts(prevValue => [
              ...prevValue,
              {
                uid: response.uid,
                first_publication_date: formatDate(
                  response.first_publication_date
                ),
                data: {
                  title: response.data.title,
                  subtitle: response.data.subtitle,
                  author: response.data.author,
                },
              },
            ]);
          });
        });
    }
  };

  return (
    <div className={commonStyles.container}>
      {posts.map(result => (
        <div key={result.uid} className={styles.postContainer}>
          <Link href={`/post/${result.uid}`}>
            <a>
              <h1>{result.data.title}</h1>
            </a>
          </Link>
          <p>{result.data.subtitle}</p>
          <div className={commonStyles.postInfoContainer}>
            <span>
              <FiCalendar color="#d7d7d7" size={15} />
              {formatDate(result.first_publication_date)}
            </span>
            <span>
              <FiUser color="#d7d7d7" size={15} />
              {result.data.author}
            </span>
          </div>
        </div>
      ))}
      {newPage && (
        <button
          onClick={() => handleLoadPosts()}
          type="button"
          className={styles.loadMore}
        >
          Carregar mais posts
        </button>
      )}
      {preview && (
        <aside className={commonStyles.preview}>
          <Link href="/api/exit-preview">
            <a>Sair do modo Preview</a>
          </Link>
        </aside>
      )}
    </div>
  );
};

export default Home;

export const getStaticProps: GetStaticProps<HomeProps> = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    { pageSize: 1, ref: previewData?.ref ?? null }
  );

  const results = postsResponse.results.map(response => {
    return {
      uid: response.uid,
      first_publication_date: response.first_publication_date,
      data: {
        title: response.data.title,
        subtitle: response.data.subtitle,
        author: response.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: { results, next_page: postsResponse.next_page },
      preview,
    },
  };
};
