import React from 'react';

export interface EmptyPoolNoticeProps {
  lang?: string;
  onResetFilter?: () => void;
  compact?: boolean;
}

export const EmptyPoolNotice: React.FC<EmptyPoolNoticeProps> = ({
  lang = 'en',
  onResetFilter,
  compact = false,
}) => {
  const isEs = lang === 'es';

  return (
    <div
      data-testid="empty-pool-notice"
      className={`w-full max-w-md mx-auto flex flex-col items-center bg-slate-900/90 border border-slate-800 rounded-2xl ${
        compact ? 'p-4' : 'p-6'
      } shadow-xl text-center space-y-3.5 select-none`}
    >
      <div className="w-10 h-10 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-xl">
        🔍
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-bold text-white tracking-tight">
          {isEs ? 'No se encontraron preguntas' : 'No Questions Found'}
        </h3>
        <p className="text-xs text-slate-400">
          {isEs
            ? 'Ninguna pregunta coincide con los filtros seleccionados.'
            : 'No questions match the current combination of filters.'}
        </p>
      </div>

      <div className="w-full p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-left text-xs space-y-1 text-slate-400">
        <div className="font-semibold text-slate-300">
          {isEs ? 'Sugerencias:' : 'Suggestions:'}
        </div>
        <ul className="list-disc list-inside space-y-0.5 text-[11px]">
          <li>
            {isEs
              ? 'Amplía el rango de cursos o temas'
              : 'Broaden your course or topic range'}
          </li>
          <li>
            {isEs
              ? 'Usa dificultad "Cualquiera"'
              : 'Set difficulty or tags to "Any"'}
          </li>
        </ul>
      </div>

      {onResetFilter && (
        <button
          type="button"
          data-testid="reset-filters-button"
          onClick={onResetFilter}
          className="w-full min-h-[44px] py-2.5 px-4 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all cursor-pointer text-xs shadow-md shadow-amber-500/20"
        >
          {isEs ? 'Restablecer filtros' : 'Reset Filters'}
        </button>
      )}
    </div>
  );
};
