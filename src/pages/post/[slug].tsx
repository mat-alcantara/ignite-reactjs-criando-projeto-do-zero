import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

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
            {/* {Math.ceil(RichText.asText(post.data.content).length / 200)}{' '} */}
            minuto(s)
          </span>
        </div>
      </div>
    </>
  );
};

export default Post;

export const getStaticPaths: GetStaticPaths = async () => {
  // const prismic = getPrismicClient();
  // const posts = await prismic.query(TODO);

  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(contentResponse => {
        return {
          heading: contentResponse.heading,
          body: RichText.asHtml(contentResponse.body),
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
