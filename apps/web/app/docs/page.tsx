import { Button } from "@inferpipe/ui/components/button";
import { Code, Zap, ArrowRight, Terminal, Globe, Shield } from "lucide-react";
import Link from "next/link";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl mb-6">
              <span className="block">inferpipe</span>
              <span className="block text-primary">Documentation</span>
            </h1>
            
            <p className="text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
              Learn how to build, test, and deploy AI pipelines with our visual workflow builder and backend SDK integration.
            </p>
          </div>

          {/* Quick Start Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-background rounded-xl p-6 border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Quick Start</h3>
              <p className="text-muted-foreground mb-4">
                Get started with your first AI workflow in minutes using our visual builder.
              </p>
              <Button variant="outline" asChild>
                <a href="/app">Start Building</a>
              </Button>
            </div>
            
            <div className="bg-background rounded-xl p-6 border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">SDK Integration</h3>
              <p className="text-muted-foreground mb-4">
                Integrate AI workflows into your application using our backend SDK.
              </p>
              <Button variant="outline" asChild>
                <Link href="#sdk">View SDK Docs</Link>
              </Button>
            </div>
            
            <div className="bg-background rounded-xl p-6 border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">API Reference</h3>
              <p className="text-muted-foreground mb-4">
                Complete API documentation for advanced integrations and custom workflows.
              </p>
              <Button variant="outline" asChild>
                <Link href="#api">API Docs</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section id="getting-started" className="py-20 lg:py-28 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-8">Getting Started</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold mb-4">1. Create Your First Workflow</h3>
              <p className="text-muted-foreground mb-4">
                Start by creating a workflow in the visual builder. Choose from pre-built templates or create a custom pipeline:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Content generation and editing</li>
                <li>Data extraction and analysis</li>
                <li>Sentiment analysis and classification</li>
                <li>Translation and localization</li>
                <li>Image and document processing</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold mb-4">2. Test Your Pipeline</h3>
              <p className="text-muted-foreground mb-4">
                Use the built-in testing tools to validate your workflow:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Test with sample data and see real-time results</li>
                <li>Debug step-by-step execution</li>
                <li>A/B test different prompts and models</li>
                <li>Monitor performance and cost metrics</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold mb-4">3. Deploy to Production</h3>
              <p className="text-muted-foreground mb-4">
                Once tested, deploy your workflow and integrate it into your application using our SDK or webhooks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SDK Documentation */}
      <section id="sdk" className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-8">SDK Integration</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold mb-4">Installation</h3>
              <div className="bg-muted rounded-lg p-4 font-mono text-sm">
                <div className="text-muted-foreground mb-2"># Install the inferpipe SDK</div>
                <div>npm install @inferpipe/sdk</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold mb-4">Basic Setup</h3>
              <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre>{`import { InferPipe } from '@inferpipe/sdk';

const inferpipe = new InferPipe({
  apiKey: process.env.INFERPIPE_API_KEY,
  workspaceId: process.env.INFERPIPE_WORKSPACE_ID,
});`}</pre>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold mb-4">Execute Workflows</h3>
              <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre>{`// Synchronous execution (wait for completion)
const result = await inferpipe.execute({
  workflowId: 'content-generation',
  input: {
    topic: 'AI automation',
    length: 'medium',
    tone: 'professional'
  }
});

console.log(result.data);`}</pre>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold mb-4">Async Execution with Webhooks</h3>
              <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre>{`// Asynchronous execution (immediate return)
const execution = await inferpipe.executeAsync({
  workflowId: 'document-analysis',
  input: { documentUrl: 'https://example.com/doc.pdf' }
});

// Results delivered to configured webhook endpoint
console.log('Execution ID:', execution.id);`}</pre>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold mb-4">Framework Examples</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Next.js API Route</h4>
                  <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                    <pre>{`// pages/api/analyze.ts
export default async function handler(req, res) {
  const result = await inferpipe.execute({
    workflowId: 'sentiment-analysis',
    input: { text: req.body.text }
  });
  
  res.json(result.data);
}`}</pre>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Express.js Route</h4>
                  <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                    <pre>{`// routes/ai.js
app.post('/extract', async (req, res) => {
  const result = await inferpipe.execute({
    workflowId: 'data-extraction',
    input: req.body
  });
  
  res.json(result.data);
});`}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-8">Best Practices</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Security</h3>
              <ul className="text-muted-foreground space-y-2">
                <li>• Keep API keys server-side only</li>
                <li>• Use environment variables for configuration</li>
                <li>• Verify webhook signatures</li>
                <li>• Implement rate limiting in your app</li>
              </ul>
            </div>
            
            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Terminal className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Performance</h3>
              <ul className="text-muted-foreground space-y-2">
                <li>• Use executeAsync() for long-running workflows</li>
                <li>• Implement caching for repeated requests</li>
                <li>• Monitor execution costs and performance</li>
                <li>• Use batch processing for multiple items</li>
              </ul>
            </div>
            
            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Error Handling</h3>
              <ul className="text-muted-foreground space-y-2">
                <li>• Implement proper try/catch blocks</li>
                <li>• Configure retry logic for transient failures</li>
                <li>• Log execution IDs for debugging</li>
                <li>• Set up monitoring and alerting</li>
              </ul>
            </div>
            
            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Testing</h3>
              <ul className="text-muted-foreground space-y-2">
                <li>• Test workflows in the dashboard first</li>
                <li>• Use test environments for development</li>
                <li>• Mock inferpipe responses in unit tests</li>
                <li>• A/B test different prompts and models</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* API Reference */}
      <section id="api" className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-8">API Reference</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold mb-4">Core Methods</h3>
              <div className="space-y-6">
                <div className="border border-border rounded-lg p-6">
                  <h4 className="font-mono text-lg mb-2">execute(options)</h4>
                  <p className="text-muted-foreground mb-4">
                    Execute a workflow synchronously and wait for completion. Best for workflows that complete quickly (&lt; 30 seconds).
                  </p>
                  <div className="bg-muted rounded p-3 font-mono text-sm">
                    Promise&lt;ExecutionResult&gt;
                  </div>
                </div>
                
                <div className="border border-border rounded-lg p-6">
                  <h4 className="font-mono text-lg mb-2">executeAsync(options)</h4>
                  <p className="text-muted-foreground mb-4">
                    Execute a workflow asynchronously with immediate return. Results delivered via configured webhooks.
                  </p>
                  <div className="bg-muted rounded p-3 font-mono text-sm">
                    Promise&lt;ExecutionInfo&gt;
                  </div>
                </div>
                
                <div className="border border-border rounded-lg p-6">
                  <h4 className="font-mono text-lg mb-2">executeStream(options)</h4>
                  <p className="text-muted-foreground mb-4">
                    Execute a workflow with streaming responses. Perfect for real-time AI interactions.
                  </p>
                  <div className="bg-muted rounded p-3 font-mono text-sm">
                    AsyncIterable&lt;StreamChunk&gt;
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold mb-4">Configuration Options</h3>
              <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre>{`interface ExecuteOptions {
  workflowId: string;
  input: Record<string, any>;
  timeout?: number;
  retryConfig?: {
    attempts: number;
    backoff?: 'fixed' | 'exponential';
    maxDelay?: number;
  };
  metadata?: Record<string, any>;
}`}</pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
            Ready to Start Building?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create your first AI workflow in minutes with our visual builder and integrate it into your application.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <a href="/app">
                Start Building
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
