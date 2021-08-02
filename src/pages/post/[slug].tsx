/* eslint-disable react/no-danger */
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import { formatDate } from '../../utils/formatDate';
import styles from './post.module.scss';

interface Post {
  uid: string;
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

const Post: React.FC<PostProps> = ({ post }) => {
  const router = useRouter();

  useEffect(() => {
    const script = document.createElement('script');
    const anchor = document.getElementById('inject-comments-for-uterances');
    script.setAttribute('src', 'https://utteranc.es/client.js');
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;
    script.setAttribute(
      'repo',
      'mat-alcantara/ignite-reactjs-criando-projeto-do-zero'
    );
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('theme', 'github-dark');
    anchor.appendChild(script);
  }, []);

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <img className={styles.banner} src={post.data.banner.url} alt="banner" />
      <div className={commonStyles.container}>
        <h1 className={styles.postTitle}>{post.data.title}</h1>
        <div className={commonStyles.postInfoContainer}>
          <span>
            <FiCalendar color="#d7d7d7" size={15} />
            {formatDate(post.first_publication_date)}
          </span>
          <span>
            <FiUser color="#d7d7d7" size={15} />
            {post.data.author}
          </span>
          <span>
            <FiClock color="#d7d7d7" size={15} />
            {post.data.content.reduce((sumTotal, content) => {
              const textTime = RichText.asText(content.body).split(' ').length;
              return Math.ceil(sumTotal + textTime / 200);
            }, 0)}{' '}
            min
          </span>
        </div>
        <div className={styles.contentContainer}>
          {post.data.content.map(contentResponse => (
            <div className={styles.content} key={contentResponse.heading}>
              <h2>{contentResponse.heading}</h2>
              <div
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(contentResponse.body),
                }}
              />
            </div>
          ))}
        </div>
        <div id="inject-comments-for-uterances" />
      </div>
    </>
  );
};

export default Post;

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts'),
  ]);

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        };
      }),
    },
  };

  return {
    props: {
      post,
    },
    revalidate: 1,
  };
};
