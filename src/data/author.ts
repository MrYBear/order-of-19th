export interface Author {
  name: string;
  avatar: string;
  url: string;
  bio?: string;
}

export const authors: Record<string, Author> = {
  'sister-betty': {
    name: 'Sister Betty',
    avatar: '/images/lady1950.png',
    url: '/members/sister-betty',
    bio: 'A devoted mother and lifelong club member who treats every clubhouse like a second living room, Betty is the warm centre of the modern Order.',
  },
  'brother-dean': {
    name: 'Brother Dean',
    avatar: '/images/man2000.png',
    url: '/members/brother-dean',
    bio: 'A working‑class links man who rose from odd jobs to Head Greenkeeper at one of the world\'s most storied courses, Dean is the Order\'s practical strategist.',
  },
  'brother-kenji': {
    name: 'Brother Kenji',
    avatar: '/images/man1950.png',
    url: '/members/brother-kenji',
    bio: 'A reserved ex‑corporate lawyer who joined the Order long before the others, Kenji is its gatekeeper, quietly insisting that any step into the public eye must be taken slowly.',
  },
};

// Default author for backward compatibility
export const author = authors['sister-betty'];


