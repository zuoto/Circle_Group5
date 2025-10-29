import { users } from '../mock-data-user/MockDataUsers.jsx';

export const mockGroups = [
    {
        id: "1",
      name: "The Fellowship of the Chaotic Dice",
      description: "Deep within the cluttered confines of a local game shop's back room (or perhaps the dimly lit corner of someone's basement), a group of unlikely adventurers gathers weekly to embark on epic quests, roll dice, and argue over the definition of 'sneak attack.' Meet the party!",
      memberCount: 12,
      coverPhotoUrl: '/covers/close-up-yahtzee-game-white-table.jpg',
      posts: [
        { id: 'p-group-1', 
          authorId: 'u2', 
          content: "Last meeting was super! Should we schedule a next one?",
                createdAt: '2025-10-27T10:00:00.000Z',
                meetup: { date: '2025-11-05T20:00:00.000Z' },
                comments: []
        },
      ]
    },
    {
      id: "2",
      name: "DIY Group",
      description: "Let's do some arts & crafts together!",
      memberCount: 9,
      coverPhotoUrl: '/covers/pexels-deeanacreates-1576210.jpg',
      posts: [
        { id: 'p-group-2', 
            authorId: 'u7', 
            content: "Anyone bringing extra yarn this week? I'm running low!",
                  createdAt: '2025-10-27T10:00:00.000Z',
                  meetup: { date: '2025-11-05T20:00:00.000Z' },
                  comments: [
                    {
                    id: 'c-group-2', 
                    authorId: 'u2', 
                    content: "I can!",
                    createdAt: '2025-10-27T10:00:00.000Z',
                    }
                  ] 
        },
        ]
    },
    {
      id: "3",
      name: "Run&Bun Club",
      description: "Join for a run every Sunday, the destination is a new bakery every week. We run 5K, then reward ourselves with the best local pastries and coffee. No pressure, just fun.",
      memberCount: 18,
      coverPhotoUrl: '/covers/side-view-fit-friends-outdoors.jpg',
      posts: [
        // No comments/posts yet
        ]
    },
    {
      id: "4",
      name: "Badminton Queens",
      description: "Badminton every Wednesday at 18. We focus on fun and light competition. Bring your own racket if you have one!",
      memberCount: 15,
      coverPhotoUrl: '/covers/badminton-concept-with-racket-shuttlecock.jpg',
      posts: [
        { id: 'p-group-4', 
            authorId: 'u5', 
            content: "Reminder: The hall is closed next Wednesday. Meeting place changed to the park courts!",
                  createdAt: '2025-10-27T10:00:00.000Z',
                  meetup: { date: '2025-11-05T20:00:00.000Z' },
                  comments: [] 
        }
        ]
    }
];

export default mockGroups;