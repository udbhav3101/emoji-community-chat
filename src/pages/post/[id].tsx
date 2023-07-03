import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { api } from "~/utils/api";
import Layout from "~/components/Layout";
import PostView from "~/components/PostView";
import { LoadingSpinner } from "~/components/Loading";
import { generateSSGHelper } from "~/server/api/helpers/ssgHelper";

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.post.getPostsByUserId.useQuery({
    userId: props.userId,
  });
  if (isLoading) {
    return (
      <div className="m-2 flex items-center justify-center">
        <LoadingSpinner size={50} />
      </div>
    );
  }
  if (!data || data.length === 0) {
    return <div>User has not posted</div>;
  }

  return (
    <div>
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const SinglePostPage: NextPage<{ id: string }> = ({ id }) => {
  const { data } = api.post.getById.useQuery({
    id,
  });
  if (!data) {
    return <div>Something went wrong</div>;
  }
  return (
    <>
      <Head>
        <title>{`${data.post.content} - @${data.author.username}`}</title>
      </Head>
      <Layout>
        <PostView {...data} />
      </Layout>
    </>
  );
};
export default SinglePostPage;

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();
  const id = context.params?.id;
  if (typeof id !== "string") throw new Error("no slug");

  await ssg.post.getById.prefetch({ id });
  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};
