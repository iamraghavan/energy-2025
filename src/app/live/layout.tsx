
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Big Screen | ScoreCast',
  description: 'Live scores dashboard for all ongoing matches.',
};

export default function LiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <head>
        <meta httpEquiv="refresh" content="300" />
      </head>
      {children}
    </>
  );
}
