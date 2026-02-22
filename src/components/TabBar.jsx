import { IconPaper, IconBoats, IconFolder, IconExame } from './Icons';

export default function TabBar({ activeTab, onTabChange }) {
    const tabs = [
        { id: 'livro', icon: <IconPaper />, label: 'Aprender' },
        { id: 'duelo', icon: <IconBoats />, label: 'Duelo' },
        { id: 'favoritos', icon: <IconFolder />, label: 'Favoritos' },
        { id: 'exame', icon: <IconExame />, label: 'Exame' }
    ];

    return (
        <div className="tab-bar">
            {tabs.map(tab => (
                <div
                    key={tab.id}
                    className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => onTabChange(tab.id)}
                >
                    <div className="tab-icon">{tab.icon}</div>
                    <span className="handwritten" style={{ fontSize: '0.8rem' }}>{tab.label}</span>
                </div>
            ))}
        </div>
    );
}
