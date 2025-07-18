import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Live Matches | ScoreCast',
  description: 'Live scores for all ongoing matches.',
};

export default function LiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <head>
        <meta http-equiv="refresh" content="120" />
      </head>
      {children}
    </>
  );
}
