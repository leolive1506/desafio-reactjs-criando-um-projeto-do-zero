import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import { AiOutlineClockCircle, AiOutlineUser } from 'react-icons/ai';
import { BsCalendar4 } from 'react-icons/bs';

import Prismic from '@prismicio/client'
import { getPrismicClient } from '../../services/prismic';

import styles from './post.module.scss';
import { useRouter } from 'next/router';
interface Post {
  uid: string
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string
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

const MEDIA_DE_PALAVRAS = 200;

export default function Post({ post }: PostProps) {
  const router = useRouter()

  if(router.isFallback) {
    return <h1>Carregando...</h1>
  }


  const handleCountAverageReading = post.data.content.reduce((acc, post) => {
      post.body.map(el => {
        const words = el.text.split(' ')
        acc += words.length
      })

      return acc
    }, 0)

  return (
    <div className={styles.container}>
      <img src={post.data.banner.url} alt="Banner" />

      <section>
          <article  className={styles.postContainer}>
            <h1 className={styles.title}>{post.data.title}</h1>
            <div className={styles.resume}>
              <time>
                <BsCalendar4 />
                {
                  format(
                    new Date(post.first_publication_date),
                    "dd MMM uu",
                    {
                      locale: ptBR,
                    }
                  )
                }
              </time>
              <p>
                <AiOutlineUser />
                {post.data.author}
              </p>
              <time>
                <AiOutlineClockCircle />
                {/* TODO: VERIFICAR GEITO USAR USECALLBACK OU USEMEMO */}
                {String(Math.ceil(handleCountAverageReading / MEDIA_DE_PALAVRAS)) + ' min'}
              </time>
            </div>

            <div className={styles.containerPost}>
              {post.data.content.map((content, index) => (
                <div key={content.heading + String(index)} className={styles.contentPost}>
                  <h2>{content.heading}</h2>
                  <div dangerouslySetInnerHTML={{ __html: RichText.asHtml(content.body) }}></div>
                </div>
              ))}
            </div>
          </article>

      </section>
    </div>
  )
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.title', 'posts.subtitle', 'posts.author', 'posts.content'],
    pageSize: 3,
  })

  const postsPaths = posts.results.map(post => {
    return { params: { slug: post.uid } }
  })

  return {
    paths: postsPaths,
    fallback: true
  }
};


export const getStaticProps: GetStaticProps = async ({params}) => {
  const { slug } = params

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url
      },
      author: response.data.author,
      content: response.data.content
    }
  }

  return {
    props: {
      post
    },
  }
};
