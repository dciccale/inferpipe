import { Button } from "@inferpipe/ui/components/button";
import {
  ArrowRight,
  Zap,
  Shield,
  Code,
  Users,
  CheckCircle,
  Star,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground mb-8">
              <Star className="w-4 h-4 mr-2" />
              Visual AI Pipeline Builder
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              <span className="block">AI Workflow</span>
              <span className="block text-primary">Builder</span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
              Build, test, and deploy AI pipelines visually. Add intelligent
              automation to any app without complex development or
              infrastructure setup.
            </p>

            <div className="mt-10 flex items-center justify-center gap-4">
              <Button size="lg" asChild>
                <a href="/app">
                  Start Building
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/docs">View Documentation</Link>
              </Button>
            </div>
          </div>

          {/* Workflow Builder Preview */}
          <div className="mt-16 lg:mt-20">
            <div className="relative mx-auto max-w-5xl">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl -z-10"></div>
              <div className="relative rounded-2xl border border-border bg-background/50 backdrop-blur p-2">
                <div className="rounded-xl overflow-hidden">
                  <Image
                    src="/workflow-builder.png"
                    alt="Visual Pipeline Builder - Drag-and-drop AI workflows"
                    width={1920}
                    height={1080}
                    className="w-full h-auto"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Why Choose inferpipe?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              The fastest way to build, test, and deploy AI pipelines.
              Enterprise-grade infrastructure with visual simplicity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-background rounded-xl p-8 border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">
                Visual Pipeline Builder
              </h3>
              <p className="text-muted-foreground">
                Drag-and-drop interface for building AI workflows. Test prompts,
                iterate on logic, and deploy to production without writing code.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-background rounded-xl p-8 border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">
                Test & Iterate Quickly
              </h3>
              <p className="text-muted-foreground">
                Built-in prompt testing, A/B testing for AI responses, real-time
                debugging, and performance monitoring for your pipelines.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-background rounded-xl p-8 border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">
                Production-Ready Deployment
              </h3>
              <p className="text-muted-foreground">
                Enterprise-grade infrastructure with automatic scaling, error
                handling, and seamless integration into any application via
                simple APIs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Perfect for Every Team
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              From startups to enterprises, inferpipe scales with your AI
              workflow needs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-6">SaaS Companies</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span>
                    Customer support automation with intelligent routing
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span>Content generation for marketing campaigns</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span>Data processing and analysis workflows</span>
                </li>
              </ul>
            </div>

            <div className="relative">
              <div className="aspect-video rounded-xl bg-muted/30 border border-border flex items-center justify-center">
                <div className="text-center">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    SaaS Workflow Example
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-20">
            <div className="relative lg:order-1">
              <div className="aspect-video rounded-xl bg-muted/30 border border-border flex items-center justify-center">
                <div className="text-center">
                  <Code className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    E-commerce Workflow Example
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:order-2">
              <h3 className="text-2xl font-bold mb-6">E-commerce Platforms</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span>Automated product description generation</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span>Review analysis and sentiment tracking</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span>Personalized email campaigns at scale</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start free, scale as you grow. No hidden fees, just transparent AI
            workflow execution.
          </p>

          <div className="inline-flex items-center space-x-4 bg-background rounded-xl p-6 border border-border">
            <div className="text-left">
              <div className="text-2xl font-bold">$49/month</div>
              <div className="text-sm text-muted-foreground">Starter plan</div>
            </div>
            <div className="w-px h-12 bg-border"></div>
            <div className="text-left">
              <div className="text-2xl font-bold">5,000</div>
              <div className="text-sm text-muted-foreground">
                executions included
              </div>
            </div>
            <div className="w-px h-12 bg-border"></div>
            <div className="text-left">
              <div className="text-2xl font-bold">10</div>
              <div className="text-sm text-muted-foreground">workflows</div>
            </div>
          </div>

          <div className="mt-8">
            <Button size="lg" asChild>
              <Link href="/pricing">View All Plans</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
            Ready to Build Your AI Pipeline?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join teams who are shipping AI features faster with visual workflows
            and enterprise infrastructure.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <a href="/app">
                Start Building for Free
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

