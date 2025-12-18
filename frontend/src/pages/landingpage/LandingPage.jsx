import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    FileText,
    Clock,
    DollarSign,
    CheckCircle,
    Zap,
    Target,
    Shield
} from 'lucide-react';
import '../../styles/landingpage.css';

const LandingPage = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: Users,
            title: 'Freelancer-First Workflow',
            description: 'Built specifically for solo freelancers and students. No enterprise bloat, just what you need.'
        },
        {
            icon: FileText,
            title: 'Simple Billing Logic',
            description: 'Create invoices in minutes. Track billable and non-billable time without confusion.'
        },
        {
            icon: Target,
            title: 'No Accounting Complexity',
            description: 'Focus on your work, not spreadsheets. We keep it simple so you can stay productive.'
        },
        {
            icon: Zap,
            title: 'Student-Friendly',
            description: 'Perfect for beginners learning to manage their first clients and projects professionally.'
        }
    ];

    const steps = [
        {
            icon: Users,
            title: 'Sign Up / Login',
            description: 'Get started in seconds'
        },
        {
            icon: FileText,
            title: 'Add Clients & Projects',
            description: 'Organize your work'
        },
        {
            icon: Clock,
            title: 'Track Time & Create Invoices',
            description: 'Log hours and bill easily'
        },
        {
            icon: DollarSign,
            title: 'Get Paid & Track Outstanding',
            description: 'Monitor your income'
        }
    ];

    const benefits = [
        'Lightweight and fast — no unnecessary features slowing you down',
        'Designed for learning and real usage, not enterprise complexity',
        'Not overloaded like FreshBooks or Harvest — just the essentials',
        'Perfect for students, beginners, and solo freelancers'
    ];

    return (
        <div className="landing-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Clarity and Control for Your Freelance Work
                    </h1>
                    <p className="hero-subtitle">
                        Manage clients, track time, and get paid — without the chaos.
                    </p>
                    <div className="hero-buttons">
                        <button
                            className="neu-btn neu-btn-primary"
                            onClick={() => navigate('/register')}
                        >
                            Sign Up
                        </button>
                        <button
                            className="neu-btn neu-btn-secondary"
                            onClick={() => navigate('/login')}
                        >
                            Login
                        </button>
                    </div>
                </div>
            </section>

            {/* Why FreelancerFlow Section */}
            <section className="why-section">
                <div className="section-header">
                    <h2 className="section-title">Why FreelancerFlow</h2>
                    <p className="section-subtitle">Built for freelancers who value simplicity</p>
                </div>
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div key={index} className="feature-card">
                            <div className="feature-icon-wrapper">
                                <feature.icon className="feature-icon" />
                            </div>
                            <h3 className="feature-title">{feature.title}</h3>
                            <p className="feature-description">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works Section */}
            <section className="how-section">
                <div className="section-header">
                    <h2 className="section-title">How It Works</h2>
                    <p className="section-subtitle">Four simple steps to get started</p>
                </div>
                <div className="steps-container">
                    {steps.map((step, index) => (
                        <div key={index} className="step-card">
                            <div className="step-icon-wrapper">
                                <step.icon className="step-icon" />
                            </div>
                            <h3 className="step-title">{step.title}</h3>
                            <p className="step-description">{step.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* What Makes It Better Section */}
            <section className="better-section">
                <div className="section-header">
                    <h2 className="section-title">What Makes It Better</h2>
                    <p className="section-subtitle">Designed for real people, not corporations</p>
                </div>
                <div className="benefits-container">
                    {benefits.map((benefit, index) => (
                        <div key={index} className="benefit-item">
                            <CheckCircle className="benefit-icon" />
                            <p className="benefit-text">{benefit}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="cta-section">
                <div className="cta-content">
                    <h2 className="cta-title">Ready to take control of your freelance business?</h2>
                    <button
                        className="neu-btn neu-btn-cta"
                        onClick={() => navigate('/register')}
                    >
                        Sign Up Now
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <p className="footer-text">© 2024 FreelancerFlow. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
