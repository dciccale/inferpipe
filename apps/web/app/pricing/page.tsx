import { Button } from "@inferpipe/ui/components/button";
import { Check, Star } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground mb-8">
              <Star className="w-4 h-4 mr-2" />
              Transparent Pricing
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl mb-6">
              Simple, Transparent Pricing
            </h1>

            <p className="text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
              Start building AI pipelines for free. Scale as you grow with
              transparent execution costs and no hidden fees.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {/* Free Plan */}
            <div className="bg-background rounded-2xl p-8 border border-border relative">
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">Free</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-muted-foreground">
                  Perfect for testing and small projects
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span>3 workflows maximum</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span>1,000 executions/month</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span>Basic models (GPT-3.5, Claude Haiku)</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span>Community support</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span>99% uptime SLA</span>
                </li>
              </ul>

              <Button className="w-full" asChild>
                <a href="/app">Get Started</a>
              </Button>
            </div>

            {/* Starter Plan */}
            <div className="bg-background rounded-2xl p-8 border border-border relative">
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">Starter</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">$49</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-muted-foreground">
                  For teams getting started with AI workflows
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span>10 workflows</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span>5,000 executions/month</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span>$0.05 per additional execution</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span>Basic models priority</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span>Email support</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span>99.5% uptime SLA</span>
                </li>
              </ul>

              <Button className="w-full" asChild>
                <a href="/app">Start Free Trial</a>
              </Button>
            </div>

            {/* Professional Plan */}
            <div className="bg-background rounded-2xl p-8 border border-primary relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">Professional</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">$149</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-muted-foreground">
                  For growing businesses scaling AI operations
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span>50 workflows</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span>25,000 executions/month</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span>$0.04 per additional execution</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span>All models (GPT-4, Claude Sonnet/Opus)</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span>Priority support (24h response)</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span>Team collaboration (10 users)</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span>99.9% uptime SLA</span>
                </li>
              </ul>

              <Button className="w-full" asChild>
                <a href="/app">Start Free Trial</a>
              </Button>
            </div>

            {/* Business Plan */}
            <div className="bg-background rounded-2xl p-8 border border-border relative">
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">Business</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">$399</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-muted-foreground">
                  For enterprises requiring advanced features
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span>Unlimited workflows</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span>100,000 executions/month</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span>$0.03 per additional execution</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span>Priority model access</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span>Dedicated customer success</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span>SSO integration</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span>Team collaboration (50 users)</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span>99.95% uptime SLA</span>
                </li>
              </ul>

              <Button className="w-full" variant="outline" asChild>
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>

          {/* Enterprise Section */}
          <div className="mt-16 text-center">
            <div className="bg-muted/30 rounded-2xl p-8 border border-border max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">Enterprise</h3>
              <p className="text-muted-foreground mb-6">
                Custom solutions for organizations with specific requirements.
                On-premise deployment, dedicated infrastructure, and white-label
                options available.
              </p>
              <Button asChild>
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                What counts as one execution?
              </h3>
              <p className="text-muted-foreground">
                One execution is a single workflow run from start to completion,
                including all steps within the workflow. Retries and partial
                failures count as separate executions.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                How are AI model costs handled?
              </h3>
              <p className="text-muted-foreground">
                AI model costs (OpenAI, Anthropic, etc.) are transparently
                passed through with a small markup for optimization and
                management. You&apos;ll see detailed cost breakdowns in your
                dashboard.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                Can I change plans anytime?
              </h3>
              <p className="text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes
                take effect at the next billing cycle, and we&apos;ll prorate
                any differences.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                What happens if I exceed my execution limits?
              </h3>
              <p className="text-muted-foreground">
                Additional executions are charged at the per-execution rate for
                your plan. You can set spending limits and receive alerts to
                avoid unexpected charges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start building AI pipelines today with our free plan. No credit card
            required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <a href="/app">Start Building for Free</a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/contact">Talk to Sales</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
