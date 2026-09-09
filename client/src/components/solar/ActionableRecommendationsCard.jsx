import React, { useState } from 'react';
import { Sparkles, Check, TrendingUp, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';

const ActionableRecommendationsCard = ({ userType = 'residential' }) => {
  const [appliedList, setAppliedList] = useState([]);

  const recommendations = [
    {
      id: 1,
      tag: 'Self-Consumption',
      title: 'Shift heavy loads to 11 AM – 3 PM',
      whatToDo: 'Run washing machines, pumps, and water heaters during peak solar hours.',
      potentialSaving: '+₹1,450 / yr saved',
    },
    {
      id: 2,
      tag: 'Panel Maintenance',
      title: 'Monthly water rinse for dust removal',
      whatToDo: 'Rinse panels in the early morning to prevent 5–10% soiling efficiency loss.',
      potentialSaving: '+8% generation yield',
    },
    {
      id: 3,
      tag: 'Subsidy Rule',
      title: 'Ensure ALMM-certified DCR panels',
      whatToDo: 'Verify that your installer selects DCR modules required for PM Surya Ghar DBT.',
      potentialSaving: 'Up to ₹78,000 subsidy',
    },
  ];

  const handleApply = (id) => {
    if (!appliedList.includes(id)) {
      setAppliedList([...appliedList, id]);
    }
  };

  return (
    <div className="lc-card space-y-4 transition-colors">
      <div className="flex items-center justify-between pb-3.5 border-b border-light-border dark:border-dark-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-btn bg-brand/10 border border-brand/20 text-brand flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-card-title font-semibold text-light-text dark:text-dark-text tracking-tight">
              Actionable AI Recommendations
            </h3>
            <p className="text-helper text-light-muted dark:text-dark-muted">
              Targeted optimizations to maximize self-consumption and savings
            </p>
          </div>
        </div>

        <span className="text-meta font-medium text-brand px-2.5 py-0.5 rounded-btn bg-brand/10 border border-brand/20">
          Smart Tips
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {recommendations.map((rec) => {
          const isApplied = appliedList.includes(rec.id);
          return (
            <div
              key={rec.id}
              className="p-3.5 rounded-btn bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border flex flex-col justify-between"
            >
              <div>
                <span className="text-label font-medium text-brand px-2 py-0.5 rounded bg-brand/10 border border-brand/20 inline-block mb-2">
                  {rec.tag}
                </span>

                <h4 className="text-body font-semibold text-light-text dark:text-dark-text leading-snug">
                  {rec.title}
                </h4>

                <p className="text-helper text-light-muted dark:text-dark-muted mt-1.5 leading-snug">
                  {rec.whatToDo}
                </p>

                <div className="mt-2.5 text-helper font-medium text-brand flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{rec.potentialSaving}</span>
                </div>
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-light-border dark:border-dark-border flex items-center justify-between gap-2">
                <Link
                  to="/solar-recommendation"
                  className="text-helper text-light-muted dark:text-dark-muted hover:text-brand transition-colors"
                >
                  Details
                </Link>

                <button
                  type="button"
                  onClick={() => handleApply(rec.id)}
                  disabled={isApplied}
                  className={`px-3 py-1 rounded-btn text-meta font-medium transition-colors cursor-pointer ${
                    isApplied
                      ? 'bg-brand text-white'
                      : 'bg-light-card dark:bg-dark-card text-brand border border-brand/40 hover:bg-brand/10'
                  }`}
                >
                  {isApplied ? (
                    <span className="flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Applied
                    </span>
                  ) : (
                    'Follow Tip'
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActionableRecommendationsCard;
