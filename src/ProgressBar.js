export const ProgressBar = (props) => {
    const { treeBudget, numTrees } = props;
    const percentage = Math.floor((numTrees/treeBudget)*100);
    console.log("percentage="+percentage);
    const percentFive = Math.round(percentage / 5) * 5
    return (
        <div className={"progress--circle progress--" + percentFive}>
            <div className="progress__number">
                <div className="number">
                    <img src={"tree_art.png"} alt="tree" className="tree-tracker-icon" />
                    <span className="remaining">{numTrees} Trees</span>
                    <span className="budget">of {treeBudget} Trees</span>
                </div>
            </div>
        </div>
    );
}

