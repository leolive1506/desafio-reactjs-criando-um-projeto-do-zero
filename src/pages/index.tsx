import { GetStaticProps } from 'next';
import { BsCalendar4 } from 'react-icons/bs';
import { AiOutlineUser } from 'react-icons/ai';
import Link from 'next/link';
import Prismic from '@prismicio/client'
import { getPrismicClient } from '../services/prismic';

import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR';
import styles from './home.module.scss';

import { useState } from 'react';

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

export default function Home({postsPagination}: HomeProps) {
  const [postList, setPostList] = useState<Post[]>(postsPagination.results)
  const [nextPage, setNextPage] = useState(postsPagination.next_page)

  async function handleNextPagePost() {
    const response = await fetch(nextPage).then(data => {
      return data.json()
    })

    response.results.map(post => {
      const postItem = {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author
        }
      }
      setNextPage(response.next_page)
      setPostList([...postList, postItem])
    })
  }
  return (
    <div className={styles.container}>
      <section>
        {postList.map(post => (
          <article key={post.uid} className={styles.postContainer}>
            <Link href={`/post/${post.uid}`}>
              <a>
                <h2 className={styles.title}>{post.data.title}</h2>
                <strong>{post.data.subtitle}</strong>
                <div>
                  <time>
                    <BsCalendar4 />
                    {format(
                      new Date(post.first_publication_date),
                      "dd MMM uu",
                      {
                        locale: ptBR,
                      }
                    )}
                  </time>
                  <p>
                    <AiOutlineUser />
                    {post.data.author}
                  </p>
                </div>
              </a>
            </Link>
          </article>
        ))}

        {nextPage && (
          <button onClick={handleNextPagePost} className={styles.nextPosts}>Carregar mais posts</button>
        )}
      </section>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient()

  const response = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.title', 'posts.subtitle', 'posts.author', 'posts.content'],
    pageSize: 1,
  })

  console.log(response)

  const posts = response.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      // format(
      //   new Date(post.first_publication_date),
      //   "dd MMM uu",
      //   {
      //     locale: ptBR,
      //   }
      // ),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      }
    }
  })

  return {
    props: {
      postsPagination: {
        next_page: response.next_page,
        results: posts,
      }
    },
  };
};
