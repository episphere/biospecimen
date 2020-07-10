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

export const userNavBar = (name) => {
    return `
        <div class="navbar-nav current-page">
            <li class="nav-item">
                <a class="nav-link" href="#dashboard" id="dashboard" title="Dashboard"><i class="fas fa-file-alt"></i> Dashboard</a>
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
        <div class="navbar-nav ml-auto">
            <div class="grid-elements dropdown">
                <button class="nav-link nav-menu-links dropdown-toggle dropdown-btn"  title="Welcome, ${name}!" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <i class="fas fa-user"></i> ${name}
                </button>
                <div class="dropdown-menu navbar-dropdown" aria-labelledby="navbarDropdown">
                    <a class="nav-link" href="#sign_out" id="signOut" title="Sign Out"><i class="fas fa-sign-out-alt"></i> Sign Out</a>
                </div>
            </div>
        </div>
    `;
}

export const nonUserNavBar = (name) => {
    return `
        <div class="navbar-nav ml-auto">
            <div class="grid-elements dropdown">
                <button class="nav-link nav-menu-links dropdown-toggle dropdown-btn"  title="Welcome, ${name}!" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <i class="fas fa-user"></i> ${name}
                </button>
                <div class="dropdown-menu navbar-dropdown" aria-labelledby="navbarDropdown">
                    <a class="nav-link" href="#sign_out" id="signOut" title="Sign Out"><i class="fas fa-sign-out-alt"></i> Sign Out</a>
                </div>
            </div>
        </div>
    `;
}

export const adminNavBar = (name) => {
    return `
        <div class="navbar-nav current-page">
            <li class="nav-item">
                <a class="nav-link" href="#dashboard" id="dashboard" title="Dashboard"><i class="fas fa-file-alt"></i> Dashboard</a>
            </li>
        </div>
        <div class="navbar-nav">
            <li class="nav-item">
                <a class="nav-link" href="#manage_users" id="manageUsers" title="Manage users"><i class="fas fa-users"></i> Manager users</a>
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
        <div class="navbar-nav ml-auto">
            <div class="grid-elements dropdown">
                <button class="nav-link nav-menu-links dropdown-toggle dropdown-btn"  title="Welcome, ${name}!" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <i class="fas fa-user"></i> ${name}
                </button>
                <div class="dropdown-menu navbar-dropdown" aria-labelledby="navbarDropdown">
                    <a class="nav-link" href="#sign_out" id="signOut" title="Sign Out"><i class="fas fa-sign-out-alt"></i> Sign Out</a>
                </div>
            </div>
        </div>
    `;
}