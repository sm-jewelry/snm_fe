import { GetStaticPaths, GetStaticProps } from 'next';

export default function CatchAllPage({ slug }: { slug: string[] }) {
  return <div>Dynamic page for: {slug.join('/')}</div>;
}

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps = async (context) => {
  return {
    props: {
      slug: (context.params?.slug as string[]) || [],
    },
  };
};
