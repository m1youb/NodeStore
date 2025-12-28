import dotenv from "dotenv";
dotenv.config();

// Mock Stripe service for demo purposes (no API key required)
const mockStripe = {
    checkout: {
        sessions: {
            create: async (options) => {
                // Simulate creating a checkout session
                const sessionId = 'mock_session_' + Math.random().toString(36).substring(2, 15);
                return {
                    id: sessionId,
                    payment_status: 'unpaid',
                    amount_total: options.line_items.reduce((total, item) => {
                        return total + (item.price_data.unit_amount * item.quantity);
                    }, 0),
                    metadata: options.metadata,
                    url: `${process.env.URL_PREFIX || 'http://localhost:5173'}/mock-checkout/${sessionId}`
                };
            },
            retrieve: async (sessionId) => {
                // Simulate retrieving a session - always return as paid for demo
                return {
                    id: sessionId,
                    payment_status: 'paid',
                    amount_total: 10000, // Mock amount
                    metadata: global.mockSessionMetadata?.[sessionId] || {}
                };
            }
        }
    },
    coupons: {
        create: async (options) => {
            // Simulate creating a coupon
            return {
                id: 'mock_coupon_' + Math.random().toString(36).substring(2, 10),
                percent_off: options.percent_off,
                duration: options.duration
            };
        }
    }
};

// Store session metadata globally for retrieval
global.mockSessionMetadata = global.mockSessionMetadata || {};

const stripe = mockStripe;
export default stripe;