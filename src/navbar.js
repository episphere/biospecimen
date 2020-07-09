export const homeNavBar = () => {
    return `
        <div class="navbar-nav current-page">
            <li class="nav-item">
                <a class="nav-link" href="#" id="home" title="Home"><i class="fas fa-home"></i> Home</a>
            </li>
        </div>
        <div class="navbar-nav">
            <li class="nav-item">
                <a target="_blank" class="nav-link" href="https://github.com/episphere/biospecimen/issues" title="Please create an issue if you encounter any"><i class="fas fa-bug"></i> Report issue</a>
            </li>
        </div>
        <div class="navbar-nav">
            <li class="nav-item">
                <a target="_blank" class="nav-link" href="https://github.com/episphere/biospecimen/projects/1" title="GitHub Projects page"><i class="fas fa-tasks"></i> GitHub Projects</a>
            </li>
        </div>
        <div class="navbar-nav">
            <li class="nav-item">
                <a target="_blank" class="nav-link" href="https://gitter.im/episphere/biospecimen" title="Chat with us"><i class="fas fa-comments"></i> Chat with us</a>
            </li>
        </div>
    `;
}