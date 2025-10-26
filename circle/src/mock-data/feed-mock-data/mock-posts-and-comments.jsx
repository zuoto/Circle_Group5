// Mock posts and comments data for feed
import { users } from '../../mock-data/mock-data-user/MockDataUsers.jsx';
export const mockPosts = [
    {
        id: 'post-1',
        authorId: 'u1',
        content: "Coffee near campus tomorrow afternoon? I'll be at Blue Oak Café around 3pm — casual catch-up for anyone who wants to join!",
        createdAt: '2025-03-01T12:10:00.000Z',
        meetup: { date: '2025-03-02T15:00:00.000Z' },
        imIns:  ['u2', 'u4'] ,
        comments: [
            {
                id: 'c1',
                author:  users.find(u => u.id === 'u2'),
                content: "Count me in — I'll bring a deck of cards if anyone's up for games.",
                createdAt: '2025-03-01T12:45:00.000Z',
            },
            {
                id: 'c2',
                author:  users.find(u => u.id === 'u3'),
                content: "Might be running late, I'll update here if I can swing by!",
                createdAt: '2025-03-01T13:02:00.000Z',
                likes: 1
            }
        ]
    },
    {
        id: 'post-2',
        authorId: 'u7',
        content: "I want to grab a beer after graphic design class today. Anyone up for it?",
        createdAt: '2025-03-01T16:30:00.000Z',
        meetup: { date: '2025-03-02T15:00:00.000Z' },
        imIns:  ['u6', 'u2'] ,
        comments: [
            {
                id: 'c1',
                author:  users.find(u => u.id === 'u6'),
                content: "Yessss! I'm dying for one!",
                createdAt: '2025-03-01T15:45:00.000Z',
            },
            {
                id: 'c2',
                author:  users.find(u => u.id === 'u1'),
                content: "Ah! I wish I could but I have another lecture after this! :(",
                createdAt: '2025-03-01T15:55:00.000Z',
            }
        ]
    },
];

export default mockPosts;