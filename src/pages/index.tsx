import { GetStaticProps } from 'next';
import { BsCalendar4 } from 'react-icons/bs';
import { AiOutlineUser } from 'react-icons/ai';
import Link from 'next/link';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

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
}

export default function Home({ postsPagination }: HomeProps) {
  return (
    <div className={styles.container}>
      <header>
        <img src="/logo.svg" alt="logo" />
      </header>
      <section>
        <article className={styles.postContainer}>
          <Link href="/post">
            <a>
              <h2 className={styles.title}>Titulo da página</h2>
              <strong>Subtitle do trem aqui mermão</strong>
              <div>
                <time>
                  <BsCalendar4 />
                  15 de mar 2021
                </time>
                <p>
                  <AiOutlineUser />
                  Autor do post
                </p>
              </div>
            </a>
          </Link>
        </article>
      </section>
    </div>
  );
}

export const getStaticProps = async () => {
  return {
    props: {
      posts: {},
    },
  };
};
