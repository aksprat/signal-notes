export type ContentItem = {
  slug: string; title: string; summary: string; date: string; topics: string[];
  readTime?: string; url?: string; status?: string; thumbnail?: string;
};

// This is the only file you need to edit to add articles, videos, and projects.
export const profile = {
  name: 'Akshit Pratiush',
  role: 'Forward Deployed Engineer | AI & Cloud Infrastructure | LLMs, GenAI, GPU Inference & Storage | Enterprise AI Architecture & Technical Delivery',
  channelUrl: 'https://www.youtube.com/@CuriousEnuf',
  email: 'hello@example.com',
  linkedIn: 'https://www.linkedin.com/in/akshit-pratiush/',
  now: 'Helping enterprises turn complex AI and cloud requirements into production-ready systems — one field note at a time.',
  skills: ['LLMs & GenAI', 'RAG', 'GPU Inference', 'AI Infrastructure', 'Kubernetes', 'Cloud Architecture', 'DigitalOcean', 'AWS', 'GCP', 'Azure', 'Customer Engineering'],
  bio: [
    'I am a Forward Deployed Engineer focused on helping enterprises turn complex AI and cloud requirements into production-ready systems. I work at the intersection of AI infrastructure, cloud architecture, software engineering, and customer delivery, partnering directly with customers to design, prototype, deploy, and troubleshoot real-world AI workloads.',
    'My current work spans Generative AI & LLMs (LLM application architecture, RAG, model deployment, fine-tuning, quantization, inference optimization, and AI evaluations), AI Infrastructure (GPU workload sizing, inference architecture, Kubernetes, KV cache, batching, prefill/decode latency, throughput, and context length), and Cloud & Distributed Systems across DigitalOcean, Google Cloud, Azure, and AWS.',
    'A significant part of my role is working closely with Product and Engineering teams — reproducing customer issues, identifying product gaps, translating field requirements into actionable technical requirements, and helping turn customer feedback into better products.',
  ],
};

export const articles: ContentItem[] = [
  { slug: 'digitalocean-inference-mode-comparison', title: 'DigitalOcean Inference Mode Comparison for Your Use Case', summary: 'A practical guide to choosing the right inference mode for an AI workload.', date: 'DigitalOcean Community', topics: ['AI', 'Inference'], url: 'https://www.digitalocean.com/community/tutorials' },
  { slug: 'upload-file-digitalocean-spaces-c-plus-plus-sdk', title: 'Upload a File to DigitalOcean Spaces Using AWS C++ SDK', summary: 'A hands-on walkthrough for using the AWS C++ SDK with DigitalOcean Spaces.', date: 'DigitalOcean Community', topics: ['Spaces', 'C++'], url: 'https://www.digitalocean.com/community/tutorials/upload-file-digitalocean-spaces-c-plus-plus-sdk' },
  { slug: 'aws-java-sdk-digitalocean-spaces', title: 'How to Use AWS Java SDK with DigitalOcean Spaces', summary: 'Connect Java applications to DigitalOcean Spaces using the familiar AWS SDK.', date: 'DigitalOcean Community', topics: ['Spaces', 'Java'], url: 'https://www.digitalocean.com/community/tutorials/how-to-use-aws-java-sdk-with-digitalocean-spaces' },
  { slug: 'connect-vpc-to-azure-using-megaport', title: 'Connecting DigitalOcean VPC to Microsoft Azure via Megaport', summary: 'Create private connectivity between DigitalOcean and Azure for distributed cloud workloads.', date: 'DigitalOcean Community', topics: ['Networking', 'Cloud'], url: 'https://www.digitalocean.com/community/tutorials/connect-vpc-to-azure-using-megaport' },
  { slug: 'sending-app-platform-logs-to-opensearch', title: 'Sending App Platform Logs to DO Managed OpenSearch', summary: 'Centralize and explore application logs with a managed OpenSearch setup.', date: 'DigitalOcean Community', topics: ['App Platform', 'Observability'], url: 'https://www.digitalocean.com/community/tutorials/sending-app-platform-logs-to-do-managed-opensearch' },
  { slug: 'partner-connect-gcp', title: 'Partner Connect GCP', summary: 'Connect DigitalOcean workloads and Google Cloud through Partner Connect.', date: 'DigitalOcean Community', topics: ['Networking', 'GCP'], url: 'https://www.digitalocean.com/community/tutorials/partner-connect-gcp' },
  { slug: 'integrate-telegram-bot-gradient', title: 'Integrate Telegram Bot with Gen AI', summary: 'Build a conversational Telegram bot backed by generative AI on DigitalOcean.', date: 'DigitalOcean Community', topics: ['Gen AI', 'Chatbots'], url: 'https://www.digitalocean.com/community/tutorials/integrate-telegram-bot-gradient' },
  { slug: 'chatbot-for-ghost-website', title: 'Chatbot for Ghost Website', summary: 'Add a generative AI chatbot to a Ghost-powered website.', date: 'DigitalOcean Community', topics: ['Gen AI', 'Chatbots'], url: 'https://www.digitalocean.com/community/tutorials/chatbot-for-ghost-website' },
  { slug: 'visualize-logs-with-goaccess', title: 'Visualise Spaces Access Logs', summary: 'Turn object-storage access logs into readable traffic insights with GoAccess.', date: 'DigitalOcean Community', topics: ['Spaces', 'Observability'], url: 'https://www.digitalocean.com/community/tutorials/visualize-logs-with-goaccess' }
];

const thumbnail = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
export const videos: ContentItem[] = [
  { slug: 'serverless-inference-production', title: 'Serverless Inference in Production', summary: 'Deploy fast, cost-efficient AI workloads on DigitalOcean.', date: 'YouTube', topics: ['AI', 'Inference'], url: 'https://www.youtube.com/watch?v=xSEis5gTK0E', thumbnail: thumbnail('xSEis5gTK0E') },
  { slug: 'serverless-inference-gradient', title: 'Serverless Inference with DigitalOcean Gradient', summary: 'An introduction to production serverless inference with DigitalOcean Gradient.', date: 'YouTube', topics: ['AI', 'Gradient'], url: 'https://www.youtube.com/watch?v=nkAjHjx_7e0', thumbnail: thumbnail('nkAjHjx_7e0') },
  { slug: 'billing-monitoring-alerts', title: 'How to Keep Your Billing in Check with Monitoring and Alerts', summary: 'Use monitoring and alerts to understand and manage cloud spend.', date: 'YouTube', topics: ['Monitoring', 'Cloud'], url: 'https://www.youtube.com/watch?v=cgw6WoLcQ6w', thumbnail: thumbnail('cgw6WoLcQ6w') },
  { slug: 'opensearch-log-forwarding', title: 'Log Forwarding to OpenSearch on App Platform', summary: 'Send App Platform logs to OpenSearch for centralized analysis.', date: 'YouTube', topics: ['App Platform', 'Observability'], url: 'https://www.youtube.com/watch?v=Jnnq16hr-fM', thumbnail: thumbnail('Jnnq16hr-fM') },
  { slug: 'doks-advanced-monitoring', title: 'DOKS Advanced Monitoring', summary: 'Explore advanced monitoring for DigitalOcean Kubernetes workloads.', date: 'YouTube', topics: ['Kubernetes', 'Monitoring'], url: 'https://www.youtube.com/watch?v=KYY5IhhOS3Q', thumbnail: thumbnail('KYY5IhhOS3Q') },
  { slug: 'ghost-chatbot-genai', title: 'Add a Chatbot to Your Ghost Website Using DigitalOcean GenAI', summary: 'A tutorial for adding a useful generative AI assistant to a Ghost site.', date: 'YouTube', topics: ['Gen AI', 'Chatbots'], url: 'https://www.youtube.com/watch?v=AHRd4YjbH6c', thumbnail: thumbnail('AHRd4YjbH6c') },
  { slug: 'ai-driven-deployment-intelligence', title: 'App Platform: AI Driven Deployment Intelligence', summary: 'See how AI can bring more intelligence to application deployments.', date: 'YouTube', topics: ['AI', 'App Platform'], url: 'https://www.youtube.com/watch?v=V0fVCHeX61c', thumbnail: thumbnail('V0fVCHeX61c') }
];

export const builds: ContentItem[] = [
  { slug: 'personal-knowledge-lab', title: 'Personal knowledge lab', summary: 'An experiment in making a private library more searchable and useful with AI.', date: 'In progress', topics: ['RAG', 'Tools'], status: 'Experiment' },
  { slug: 'prompt-notebook', title: 'Prompt notebook', summary: 'A small collection of tested prompts, what they do, and when they fail.', date: 'Ongoing', topics: ['Prompting', 'Learning'], status: 'Open notes' }
];

export const paths = [
  ['01', 'Start with the basics', 'Get a clear mental model of models, tokens, prompting, and what AI can—and cannot—do.', 'Foundations'],
  ['02', 'See it in practice', 'Follow short builds and videos to turn concepts into something you can recognise and use.', 'Builds'],
  ['03', 'Develop your point of view', 'Read candid notes on what is changing, what matters, and what I am still figuring out.', 'Notes']
];
